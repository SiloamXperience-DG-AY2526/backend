import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

// POST /projects/match?projectId=XXXX&volunteerId=XXXX - Match a volunteer to a project
export const matchVolunteerToProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId, volunteerId } = req.query;

  // Validate required query parameters
  if (!projectId || !volunteerId) {
    throw new ValidationError(
      'Missing required query parameters: projectId and volunteerId are required',
      {
        missing: [],
        ...(!projectId && { projectId: 'projectId is required' }),
        ...(!volunteerId && { volunteerId: 'volunteerId is required' }),
      }
    );
  }

  const projectIdStr = projectId as string;
  const volunteerIdStr = volunteerId as string;

  // Check if volunteer exists
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerIdStr },
  });

  if (!volunteer) {
    throw new NotFoundError(`Volunteer with id ${volunteerIdStr} not found`);
  }

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectIdStr },
  });

  if (!project) {
    throw new NotFoundError(`Project with id ${projectIdStr} not found`);
  }

  // Check if VolunteerProject already exists (unique constraint)
  const existingMatch = await prisma.volunteerProject.findFirst({
    where: {
      volunteerId: volunteerIdStr,
      projectId: projectIdStr,
    },
  });

  if (existingMatch) {
    throw new ValidationError(
      'Volunteer is already matched to this project',
      {
        duplicate: 'volunteer_project',
        message: 'This volunteer-project match already exists',
      }
    );
  }

  // Create VolunteerProject with approval fields as null
  try {
    const volunteerProject = await prisma.volunteerProject.create({
      data: {
        volunteerId: volunteerIdStr,
        projectId: projectIdStr,
        approvedAt: null,
        approvedBy: null,
        approvalNotes: null,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Volunteer matched to project successfully (pending approval)',
      data: volunteerProject,
    });
  } catch (error: any) {
    // Handle unique constraint violation (P2002)
    if (error.code === 'P2002') {
      throw new ValidationError(
        'Volunteer is already matched to this project',
        {
          duplicate: 'volunteer_project',
          message: 'This volunteer-project match already exists',
        }
      );
    }
    throw error;
  }
};

