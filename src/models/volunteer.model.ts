import { prisma } from '../lib/prisma';
import {
  UpdateVolunteerProjectInput,
  CreateVolunteerProjectInput,
} from '../schemas/volunteer';

const pmPublicInfo = {
  select: {
    id: true,
    title: true,
    firstName: true,
    lastName: true,
  },
} as const;

export const getVolunteerProjectsByManager = async (managerId: string) => {
  const projects = await prisma.volunteerProject.findMany({
    where: {
      managedById: managerId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });
  return projects;
};

export const getVolunteerProjectById = async (
  projectId: string,
  managerId: string
) => {
  const project = await prisma.volunteerProject.findFirst({
    where: {
      id: projectId,
      managedById: managerId,
    },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
      positions: {
        include: {
          skills: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
  return project;
};

export const updateVolunteerProject = async (
  projectId: string,
  managerId: string,
  data: UpdateVolunteerProjectInput
) => {
  // First verify the project belongs to the manager
  const existingProject = await prisma.volunteerProject.findFirst({
    where: {
      id: projectId,
      managedById: managerId,
    },
  });

  if (!existingProject) {
    return null;
  }

  const updatedProject = await prisma.volunteerProject.update({
    where: {
      id: projectId,
    },
    data: {
      ...data,
    },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return updatedProject;
};

export const createVolunteerProject = async (
  managerId: string,
  data: CreateVolunteerProjectInput
) => {
  const { objectivesList, ...projectData } = data;

  const project = await prisma.volunteerProject.create({
    data: {
      ...projectData,
      managedById: managerId,
      submissionStatus: 'draft', // New projects start as draft
      approvalStatus: 'pending', // Awaiting approval
      objectivesList: objectivesList
        ? {
          create: objectivesList.map((obj) => ({
            objective: obj.objective,
            order: obj.order,
          })),
        }
        : undefined,
    },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return project;
};

