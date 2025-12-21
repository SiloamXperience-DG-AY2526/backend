import { PrismaClient, FieldType } from '@prisma/client';
import { Request, Response } from 'express';
import { sendVolunteerApplicationEmail } from '../utils/email';

const prisma = new PrismaClient();

export const submitVolunteerApplication = async (req: Request, res: Response) => {
  try {
    const { userId, projectId, projectPositionId } = req.body;

    if (!userId || !projectId || !projectPositionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // get project
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // get project position
    const projectPosition = await prisma.projectPosition.findUnique({ where: { id: projectPositionId } });
    if (!projectPosition) return res.status(404).json({ error: 'Project position not found' });

    // get volunteer
    const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
    if (!volunteer) return res.status(400).json({ error: 'Volunteer profile does not exist' });

    // get volunteer detail through personal detail form
    const submission = await prisma.submission.findUnique({
      where: { id: volunteer.formSubmissionId },
      include: {
        responses: { include: { field: true } },
      },
    });

    const getResponseValue = (alias: string) => {
      return submission?.responses.find(
        (r: typeof submission.responses[number]) => r.field.fieldAlias === alias
      )?.value || '';
    };

    // get necessary fields for application from sign up form
    const name = getResponseValue('name');
    const gender = getResponseValue('gender');
    const contactNumber = getResponseValue('contact_number');

    // fetch or create volunteer application form
    let volunteerForm = await prisma.form.findFirst({
      where: { slug: 'volunteer-application' },
      include: { fields: true },
    });

    if (!volunteerForm) {
      volunteerForm = await prisma.form.create({
        data: {
          title: 'Volunteer Application Form',
          slug: 'volunteer-application',
          fields: {
            create: [
              { fieldTitle: 'Project Title', fieldAlias: 'project_title', fieldType: FieldType.TEXT, sortOrder: 1 },
              { fieldTitle: 'Volunteer Position', fieldAlias: 'volunteer_position', fieldType: FieldType.TEXT, sortOrder: 2 },
              { fieldTitle: 'Date and Time', fieldAlias: 'date_time', fieldType: FieldType.TEXT, sortOrder: 3 },
              { fieldTitle: 'Name', fieldAlias: 'name', fieldType: FieldType.TEXT, sortOrder: 4 },
              { fieldTitle: 'Gender', fieldAlias: 'gender', fieldType: FieldType.TEXT, sortOrder: 5 },
              { fieldTitle: 'Contact Number', fieldAlias: 'contact_number', fieldType: FieldType.TEXT, sortOrder: 6 },
            ],
          },
        },
        include: { fields: true },
      });
    }

    // match the response to the form fields
    const responsesData = volunteerForm.fields
      .map((f: typeof volunteerForm.fields[number]) => {
        switch (f.fieldAlias) {
        case 'project_title':
          return { fieldId: f.id, value: project.title };
        case 'volunteer_position':
          return { fieldId: f.id, value: projectPosition.title };
        case 'date_time':
          return { fieldId: f.id, value: project.startDate.toISOString() };
        case 'name':
          return { fieldId: f.id, value: name };
        case 'gender':
          return { fieldId: f.id, value: gender };
        case 'contact_number':
          return { fieldId: f.id, value: contactNumber };
        default:
          return null;
        }
      })
      .filter(
        (r): r is { fieldId: string; value: string } => r !== null
      );


    // submit the volunteer application
    const newSubmission = await prisma.submission.create({
      data: {
        formId: volunteerForm.id,
        userId,
        responses: { create: responsesData },
      },
      include: { responses: true },
    });

    // volunteer application stored in volunteer_project table
    const volunteerProject = await prisma.volunteerProject.create({
      data: {
        volunteerId: volunteer.id,
        projectId: project.id,
        projectPositionId: projectPosition.id,
      },
    });
    //send email
    sendVolunteerApplicationEmail({
      to: 'tasmiyahwork@gmail.com' , //should be user's email, used personal for testing
      name,
      projectTitle: project.title,
      positionTitle: projectPosition.title,
      startDate: project.startDate,
    }).catch((err) => {
      console.error('Email sending failed:', err);
    });

    return res.status(201).json({
      message: 'Volunteer application submitted successfully',
      submission: newSubmission,
      volunteerProject,
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};


export const getVolunteerApplications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    // get volunteer profile
    const volunteer = await prisma.volunteer.findUnique({
      where: { userId },
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    // get respective volunteer applications
    const volunteerProjects = await prisma.volunteerProject.findMany({
      where: { volunteerId: volunteer.id },
      include: {
        project: true,
        projectPosition: true,
        approver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    //check status based on approved at field
    const applications = volunteerProjects.map(
      (vp: typeof volunteerProjects[number]) => ({
        projectId: vp.projectId,
        projectTitle: vp.project.title,
        position: vp.projectPosition.title,
        submittedAt: vp.createdAt,
        status: vp.approvedAt ? 'PROCESSED' : 'PENDING',
        approvedAt: vp.approvedAt,
        approvedBy: vp.approver?.name ?? null,
        approvalNotes: vp.approvalNotes,
      }));

    return res.status(200).json({
      userId,
      applications,
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};

export const getAvailableVolunteerActivities = async (
  req: Request,
  res: Response
) => {
  try {
    const { page = '1', limit = '10', search } = req.query; //adjustable

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    if (pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({ error: 'Invalid pagination values' });
    }

    // check for future projects available
    const now = new Date();

    // Fetch projects that can have volunteering and start date is today onwards

    const projects = await prisma.project.findMany({
      where: {
        hasVolunteering: true,
        startDate: {
          gte: now,
        },
        ...(search && {
          title: {
            contains: search as string,
            mode: 'insensitive',
          },
        }),
      },
      include: {
        projectPositions: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // check if project has slots
    const availableProjects = projects
      .map((project: typeof projects[number]) => {
        const availablePositions = project.projectPositions.filter(
          (pos) => pos.filled < pos.slots
        );

        if (availablePositions.length === 0) return null;

        return {
          ...project,
          projectPositions: availablePositions,
        };
      })
      .filter(Boolean) as typeof projects;

    // pagination after filtering
    const total = availableProjects.length;
    const totalPages = Math.ceil(total / pageSize);

    const paginated = availableProjects.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    // return data
    const data = paginated.map((project: typeof paginated[number]) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      positions: project.projectPositions.map(pos => ({
        id: pos.id,
        title: pos.title,
        slots: pos.slots,
        filled: pos.filled,
        availableSlots: pos.slots - pos.filled,
      })),
    }));

    return res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages,
      data,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};


