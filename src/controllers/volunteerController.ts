import { PrismaClient, FieldType } from '@prisma/client';

import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Submit a new volunteer application
export const submitVolunteerApplication = async (req: Request, res: Response) => {
  try {
    //question: userid to be retrieved from user session? and if gender and contact must be prefilled shldnt it be in user schema?
    const { userId, formId, projectTitle, volunteerPosition, dateTime, name, gender, contactNumber } = req.body;

    if (!userId || !formId || !projectTitle || !volunteerPosition || !dateTime || !name || !gender || !contactNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the form by ID
    let volunteerForm = formId
      ? await prisma.form.findUnique({ where: { id: formId }, include: { fields: true } })
      : null;
    //if form isnt found, auto create?
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

    // Map responses dynamically to the fields
    const responsesData = volunteerForm.fields
      .map((field): { fieldId: string; value: string } | null => {
        switch (field.fieldAlias) {
          case 'project_title':
            return { fieldId: field.id, value: projectTitle };
          case 'volunteer_position':
            return { fieldId: field.id, value: volunteerPosition };
          case 'date_time':
            return { fieldId: field.id, value: dateTime };
          case 'name':
            return { fieldId: field.id, value: name };
          case 'gender':
            return { fieldId: field.id, value: gender };
          case 'contact_number':
            return { fieldId: field.id, value: contactNumber };
          default:
            return null;
        }
      })
      .filter((r): r is { fieldId: string; value: string } => r !== null);

    // Create Submission
    const submission = await prisma.submission.create({
      data: {
        formId: volunteerForm.id,
        userId,
        responses: { create: responsesData },
      },
      include: { responses: true },
    });

   //question: what if the volunteer submits to multiple project? (regarding formSubmissionId field)
    //current volunteer table only points to one form submissionid and has status for one application only
    //shldnt status be in submission schema?
    const volunteer = await prisma.volunteer.create({
      data: {
        userId,
        formSubmissionId: submission.id,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      message: 'Volunteer application submitted successfully',
      form: volunteerForm,
      submission,
      volunteer,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};