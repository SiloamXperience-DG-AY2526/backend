import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  GetVolunteerApplicationsInput,
  SubmitVolApplicationInput
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

