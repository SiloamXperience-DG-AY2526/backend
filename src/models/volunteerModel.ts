import { prisma } from '../lib/prisma';
import { getResponseValue } from '../helpers/getResponseHelper';
import {  GetVolunteerApplicationsOutput, VolunteerActivity,
  PaginatedVolunteerActivities, 
  
  GetAvailableVolunteerActivities} from '../schemas/volunteer';
import { NotFoundError } from '../utils/errors';
type ProjectPositionType = {
  id: string;
  title: string;
  slots: number;
  filled: number;
};

type ProjectType = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  projectPositions: ProjectPositionType[];
};

export type SubmitVolunteerApplicationInput = {
  userId: string;
  projectId: string;
  projectPositionId: string;
};


export const submitVolunteerApplicationModel = async ({
  userId,
  projectId,
  projectPositionId,
}: SubmitVolunteerApplicationInput) => {

  // get project
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('PROJECT_NOT_FOUND');

  // get project position
  const projectPosition = await prisma.projectPosition.findUnique({
    where: { id: projectPositionId },
  });
  if (!projectPosition) throw new NotFoundError('PROJECT_POSITION_NOT_FOUND');

  // get volunteer
  const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
  if (!volunteer) throw new NotFoundError('VOLUNTEER_NOT_FOUND');

  // get volunteer personal details 
  const volunteer_details = await prisma.submission.findUnique({
    where: { id: volunteer.formSubmissionId },
    include: {
      responses: { include: { field: true } },
    },
  });

  const name = getResponseValue(volunteer_details, 'name');
  const gender = getResponseValue(volunteer_details, 'gender');
  const contactNumber = getResponseValue(volunteer_details, 'contact_number');

  // fetch volunteer application form
  const volunteerForm = await prisma.form.findFirst({
    where: { slug: 'volunteer-application' },
    include: { fields: true },
  });

  if (!volunteerForm) {
    throw new Error('VOLUNTEER_FORM_NOT_FOUND');
  }

  // map responses to form fields
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
    .filter(Boolean) as { fieldId: string; value: string }[];

  // create submission and link volunteer to project
  const [newSubmission, volunteerProject] = await prisma.$transaction([
    prisma.submission.create({
      data: {
        formId: volunteerForm.id,
        userId,
        responses: { create: responsesData },
      },
      include: { responses: true },
    }),
    prisma.volunteerProject.create({
      data: {
        volunteerId: volunteer.id,
        projectId: project.id,
        projectPositionId: projectPosition.id,
      },
    }),
  ]);
  return {
    submission: newSubmission,
    volunteerProject,
  };
};



export const getVolunteerApplicationsModel = async (userId: string): Promise<GetVolunteerApplicationsOutput> => {
  const volunteer = await prisma.volunteer.findUnique({
    where: { userId },
  });

  if (!volunteer) throw new Error('VOLUNTEER_NOT_FOUND');

  const volunteerProjects = await prisma.volunteerProject.findMany({
    where: { volunteerId: volunteer.id },
    include: {
      project: true,
      projectPosition: true,
      approver: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const applications = volunteerProjects.map(
    (vp: typeof volunteerProjects[number]) => ({
      projectId: vp.projectId,
      projectTitle: vp.project.title,
      position: vp.projectPosition.title,
      submittedAt: vp.createdAt,
      status: (vp.approvedAt ? 'PROCESSED' : 'PENDING') as 'PENDING' | 'PROCESSED',
      approvedAt: vp.approvedAt,
      approvedBy: vp.approver?.name ?? null,
      approvalNotes: vp.approvalNotes,
    }));

  return { userId, applications };
};

export const getAvailableVolunteerActivitiesModel = async ({
  page = 1,
  limit = 10,
  search,
}: GetAvailableVolunteerActivities): Promise<PaginatedVolunteerActivities> => {
  if (page < 1 || limit < 1) throw new Error('INVALID_PAGINATION');

  const now = new Date();

  const [total, projects] = await Promise.all([
    prisma.project.count({
      where: {
        hasVolunteering: true,
        startDate: { gte: now },
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        projectPositions: { some: {} },
      },
    }),
    prisma.project.findMany({
      where: {
        hasVolunteering: true,
        startDate: { gte: now },
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        projectPositions: { some: {} },
      },
      include: { projectPositions: true },
      orderBy: { startDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const availableProjects = projects
    .map((project: ProjectType) => {
      const availablePositions = project.projectPositions.filter(
        (p) => p.filled < p.slots
      );
      if (availablePositions.length === 0) return null;
      return { ...project, projectPositions: availablePositions };
    })
    .filter(Boolean) as ProjectType[];

  const data: VolunteerActivity[] = availableProjects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    startDate: project.startDate,
    positions: project.projectPositions.map((pos) => ({
      id: pos.id,
      title: pos.title,
      slots: pos.slots,
      filled: pos.filled,
      availableSlots: pos.slots - pos.filled,
    })),
  }));

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data,
  };
};