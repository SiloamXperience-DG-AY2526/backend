import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  GetVolunteerApplicationsInput,
  SubmitVolApplicationInput,
  MatchVolunteerToProjectInput,
  ApproveVolunteerMatchInput,
  AnyVolApplicationsQueryInput,
  UpdateVolunteerApplicationStatusInput,
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
    select: {
      id: true,
      status: true,
      createdAt: true,

  
      volunteerProjectFeedbackId: true,

      position: {
        select: {
          id: true,
          role: true,
          project: {
            select: {
              id: true,
              title: true,
              aboutDesc: true,
              location: true,
              startDate: true,
              startTime: true,
              endTime: true,
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

    // feedback check
    feedbackGiven: Boolean(r.volunteerProjectFeedbackId),

    project: {
      id: r.position.project.id,
      title: r.position.project.title,
      description: r.position.project.aboutDesc, 
      location: r.position.project.location,
      startDate: r.position.project.startDate,
      startTime: r.position.project.startTime,
      endTime: r.position.project.endTime,
      endDate: r.position.project.endDate,
      operationStatus: r.position.project.operationStatus,
    },
    position: {
      id: r.position.id,
      role: r.position.role,
    },
  }));
};

export const getAllVolunteerApplicationsModel = async (
  filters: AnyVolApplicationsQueryInput
) => {
  const { userId, projectId, status } = filters;

  const records = await prisma.volunteerProjectPosition.findMany({
    where: {
      ...(userId ? { volunteerId: userId } : {}),
      ...(status ? { status } : {}),
      ...(projectId
        ? {
            position: {
              projectId,
            },
          }
        : {}),
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      availability: true,
      position: {
        select: {
          id: true,
          role: true,
          projectId: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return records.map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: r.createdAt,
    availability: r.availability ?? null,
    position: r.position,
    volunteer: r.volunteer,
  }));
};

export const submitVolunteerApplication = async (input: SubmitVolApplicationInput) => {
  const { userId, applicationDetails } = input;
  const { projectId, positionId, hasConsented, availability, sessionIds } = applicationDetails;

  // unique session ids (avoid duplicates)
  const uniqueSessionIds = Array.from(new Set(sessionIds ?? []));

  try {
    return await prisma.$transaction(async (tx) => {
      // 0) fetch user details for response
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          partner: {
            select: {
              gender: true,
              countryCode: true,
              contactNumber: true,
            },
          },
        },
      });

      if (!user) throw new NotFoundError('USER_NOT_FOUND');

      // 1) position must exist + include project
      const position = await tx.projectPosition.findUnique({
        where: { id: positionId },
        select: {
          id: true,
          projectId: true,
          role: true,
          project: {
            select: {
              id: true,
              title: true,
              location: true,
              operationStatus: true,
              startDate: true,
              endDate: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      });

      if (!position) throw new NotFoundError('POSITION_NOT_FOUND');

      // 2) position must belong to the projectId passed by FE
      if (position.projectId !== projectId) {
        throw new ConflictError('POSITION_NOT_IN_PROJECT');
      }

      // 3) project must be ongoing
      if (position.project.operationStatus !== 'ongoing') {
        throw new ConflictError('PROJECT_NOT_OPERATIONAL');
      }

      // 4) prevent duplicate application
      const existing = await tx.volunteerProjectPosition.findUnique({
        where: {
          volunteerId_positionId: {
            volunteerId: userId,
            positionId,
          },
        },
        select: { id: true },
      });

      if (existing) throw new ConflictError('ALREADY_APPLIED');

      // 5) validate sessions (all must belong to project)
      if (uniqueSessionIds.length > 0) {
        const sessions = await tx.session.findMany({
          where: {
            id: { in: uniqueSessionIds },
            projectId,
          },
          select: { id: true },
        });

        if (sessions.length !== uniqueSessionIds.length) {
          throw new NotFoundError('SESSION_NOT_FOUND');
        }
      }

      // 6) create application (+ availability)
      const application = await tx.volunteerProjectPosition.create({
        data: {
          volunteerId: userId,
          positionId,
          status: 'reviewing',
          hasConsented,
          availability: availability ?? null,
        },
        select: {
          id: true,
          volunteerId: true,
          positionId: true,
          status: true,
          hasConsented: true,
          availability: true,
          createdAt: true,
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
                  startTime: true,
                  endTime: true,
                  operationStatus: true,
                },
              },
            },
          },
        },
      });

      // 7) create volunteerSessions (many)
      if (uniqueSessionIds.length > 0) {
        await tx.volunteerSession.createMany({
          data: uniqueSessionIds.map((sid) => ({
            volunteerId: userId,
            sessionId: sid,
          })),
          skipDuplicates: true,
        });
      }

      // optional at the moment
      const selectedSessions =
        uniqueSessionIds.length > 0
          ? await tx.session.findMany({
            where: { id: { in: uniqueSessionIds } },
            select: {
              id: true,
              name: true,
              sessionDate: true,
              startTime: true,
              endTime: true,
            },
            orderBy: { sessionDate: 'asc' },
          })
          : [];

      // 8) return
      return {
        application,
        volunteer: {
          userId: user.id,
          name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
          gender: user.partner?.gender ?? null,
          contactNumber:
            user.partner?.countryCode && user.partner?.contactNumber
              ? `${user.partner.countryCode}${user.partner.contactNumber}`
              : null,
        },
        project: {
          projectId: application.position.project.id,
          title: application.position.project.title,
          location: application.position.project.location,
          startDate: application.position.project.startDate,
          endDate: application.position.project.endDate,
          startTime: application.position.project.startTime,
          endTime: application.position.project.endTime,
          operationStatus: application.position.project.operationStatus,
        },
        availability: application.availability ?? null,
        selectedSessions,
      };
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') throw new ConflictError('ALREADY_APPLIED');
      if (err.code === 'P2003') throw new NotFoundError('RELATED_RECORD_MISSING');
      if (err.code === 'P2025') throw new NotFoundError('RECORD_NOT_FOUND');
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

export const updateVolunteerApplicationStatus = async (
  matchId: string,
  approverId: string,
  data: UpdateVolunteerApplicationStatusInput
) => {
  const existingMatch = await prisma.volunteerProjectPosition.findUnique({
    where: { id: matchId },
    select: {
      id: true,
    },
  });

  if (!existingMatch) {
    throw new NotFoundError('Match not found');
  }

  const isApproved = data.status === 'approved';

  const updatedMatch = await prisma.volunteerProjectPosition.update({
    where: { id: matchId },
    data: {
      status: data.status,
      approvedAt: isApproved ? new Date() : null,
      approvedBy: isApproved ? approverId : null,
    },
    select: {
      id: true,
      status: true,
      approvedAt: true,
      approvedBy: true,
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

  return updatedMatch;
};
