import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  GetVolunteerApplicationsInput,
  SubmitVolApplicationInput,
  MatchVolunteerToProjectInput,
  ApproveVolunteerMatchInput
} from '../schemas';
import { ConflictError, NotFoundError } from '../utils/errors';

export const getVolunteerApplicationsModel = async ({
  userId,
  filters,
}: GetVolunteerApplicationsInput) => {
  const {status} = filters;
  const records = await prisma.volunteerProjectPosition.findMany({
    where: {
      volunteerId: userId,
      ...(status && { status }),
    },
    include: {
      position: {
        select: {
          id: true,
          role: true,
          project: {
            select: {
              id: true,
              title: true,
              location: true,
              startDate: true,
              endDate: true,
              operationStatus: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return records.map((r) => ({
    applicationId: r.id,
    status: r.status,
    appliedAt: r.createdAt,
    project: {
      id: r.position.project.id,
      title: r.position.project.title,
      location: r.position.project.location,
      startDate: r.position.project.startDate,
      endDate: r.position.project.endDate,
      operationStatus: r.position.project.operationStatus,
    },
    position: {
      id: r.position.id,
      role: r.position.role,
    },
  }));
};

export const submitVolunteerApplication = async (input: SubmitVolApplicationInput) => {
  const {userId, applicationDetails} = input;
  const { positionId} = applicationDetails;
  try {
    const application = prisma.$transaction(async (tx) => {
      //Duplicate Application not possible due to [userId, positionId] unique constraint
      //FK constraint ensures positionId exists, check project is ongoing
      const doesPositionExist = await tx.projectPosition.findFirst({
        where: {
          id: positionId,
          project: {
            operationStatus: 'ongoing',
          }},
        select: {
          id: true,
          project: { select: { id: true } },
        }}
      );
      if (!doesPositionExist) {
        throw new ConflictError('Project is not operational or position does not exist');
      }
      await tx.volunteerProjectPosition.create({
        data: {
          volunteerId: userId,
          status: 'reviewing',
          ...applicationDetails
        },
        select: {
          id: true,
          volunteerId: true,
          positionId: true,
          status: true,
          hasConsented: true,
          createdAt: true,
        },
      });
    });
    return application;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') throw new ConflictError('You have already applied');
      if (err.code === 'P2003') throw new NotFoundError('Related record missing');
    }
    throw err;
  }
};


export const matchVolunteerToProject = async (input: MatchVolunteerToProjectInput) => {
  const { volunteerId, projectId, positionId } = input;
  
  const match = await prisma.$transaction(async (tx) => {
    // Verify project exists and is operational
    const project = await tx.volunteerProject.findFirst({
      where: {
        id: projectId,
        operationStatus: 'ongoing',
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found or is not operational');
    }

    // If positionId is not provided, find the first position in the project
    let finalPositionId = positionId;
    if (!finalPositionId) {
      const firstPosition = await tx.projectPosition.findFirst({
        where: {
          projectId: projectId,
        },
        select: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (!firstPosition) {
        throw new NotFoundError('Project has no positions. Please specify a positionId or create positions for the project first');
      }

      finalPositionId = firstPosition.id;
    } else {
      // Verify the position exists and belongs to the project
      const position = await tx.projectPosition.findFirst({
        where: {
          id: finalPositionId,
          projectId: projectId,
        },
        select: {
          id: true,
        },
      });

      if (!position) {
        throw new NotFoundError('Position not found or does not belong to the specified project');
      }
    }

    // Create the match (VolunteerProjectPosition) with status 'reviewing'
    const volunteerProjectPosition = await tx.volunteerProjectPosition.create({
      data: {
        volunteerId: volunteerId,
        positionId: finalPositionId,
        status: 'reviewing',
        hasConsented: false, // Volunteer hasn't consented yet (this is a match, not an application)
      },
      select: {
        id: true,
        volunteerId: true,
        positionId: true,
        status: true,
        hasConsented: true,
        createdAt: true,
        position: {
          select: {
            id: true,
            role: true,
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return volunteerProjectPosition;
  });

  return match;
};

export const approveVolunteerMatch = async (
  matchId: string,
  approverId: string,
  data: ApproveVolunteerMatchInput
) => {
  // Verify the match exists and is in 'reviewing' status
  const existingMatch = await prisma.volunteerProjectPosition.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingMatch) {
    throw new NotFoundError('Match not found');
  }

  if (existingMatch.status !== 'reviewing') {
    throw new ConflictError(`Match cannot be approved. Current status: ${existingMatch.status}`);
  }

  // Update the match to approved status
  const approvedMatch = await prisma.volunteerProjectPosition.update({
    where: { id: matchId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: approverId,
      approvalNotes: data.approvalNotes,
      approvalMessage: data.approvalMessage,
    },
    select: {
      id: true,
      volunteerId: true,
      positionId: true,
      status: true,
      approvedAt: true,
      approvedBy: true,
      approvalNotes: true,
      approvalMessage: true,
      createdAt: true,
      updatedAt: true,
      position: {
        select: {
          id: true,
          role: true,
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      volunteer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return approvedMatch;
};

