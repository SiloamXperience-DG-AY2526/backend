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

// POST /projects/match/approve - Approve a volunteer-project match
export const approveVolunteerProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { volunteerProjectId } = req.body;

  // Validate required body parameter
  if (!volunteerProjectId) {
    throw new ValidationError(
      'Missing required field: volunteerProjectId is required in request body',
      {
        volunteerProjectId: 'volunteerProjectId is required',
      }
    );
  }

  // Check if VolunteerProject exists
  const volunteerProject = await prisma.volunteerProject.findUnique({
    where: { id: volunteerProjectId },
  });

  if (!volunteerProject) {
    throw new NotFoundError(
      `VolunteerProject with id ${volunteerProjectId} not found`
    );
  }

  // Check if already approved
  if (volunteerProject.approvedAt !== null) {
    throw new ValidationError(
      'VolunteerProject is already approved',
      {
        alreadyApproved: true,
        message: 'This volunteer-project match has already been approved',
      }
    );
  }

  // Update VolunteerProject with approval
  const updatedVolunteerProject = await prisma.volunteerProject.update({
    where: { id: volunteerProjectId },
    data: {
      approvedAt: new Date(),
      // approvedBy can be set when authentication is implemented
      // approvedBy: req.user?.id,
    },
  });

  res.json({
    status: 'success',
    message: 'Volunteer-project match approved successfully',
    data: updatedVolunteerProject,
  });
};

// POST /projects/match/deny - Deny a volunteer-project match
export const denyVolunteerProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { volunteerProjectId } = req.body;

  // Validate required body parameter
  if (!volunteerProjectId) {
    throw new ValidationError(
      'Missing required field: volunteerProjectId is required in request body',
      {
        volunteerProjectId: 'volunteerProjectId is required',
      }
    );
  }

  // Check if VolunteerProject exists
  const volunteerProject = await prisma.volunteerProject.findUnique({
    where: { id: volunteerProjectId },
  });

  if (!volunteerProject) {
    throw new NotFoundError(
      `VolunteerProject with id ${volunteerProjectId} not found`
    );
  }

  // Delete the VolunteerProject record (denial = removal of match)
  await prisma.volunteerProject.delete({
    where: { id: volunteerProjectId },
  });

  res.json({
    status: 'success',
    message: 'Volunteer-project match denied and removed successfully',
  });
};

