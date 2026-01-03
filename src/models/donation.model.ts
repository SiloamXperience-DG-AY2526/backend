import { prisma } from '../lib/prisma';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';
import { SubmissionStatus, ProjectApprovalStatus } from '@prisma/client';

const pmPublicInfo = {
  select: {
    id: true,
    title: true,
    firstName: true,
    lastName: true,
  },
} as const;

export const getDonationProjectsByManager = async (managerId: string) => {
  const projects = await prisma.donationProject.findMany({
    where: {
      managedBy: managerId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      project_manager: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });
  return projects;
};

export const getDonationProjectById = async (
  projectId: string,
  managerId: string
) => {
  const project = await prisma.donationProject.findFirst({
    where: {
      id: projectId,
      managedBy: managerId,
    },
    include: {
      project_manager: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });
  return project;
};

export const updateDonationProject = async (
  projectId: string,
  managerId: string,
  data: UpdateDonationProjectInput
) => {
  // First verify the project belongs to the manager
  const existingProject = await prisma.donationProject.findFirst({
    where: {
      id: projectId,
      managedBy: managerId,
    },
  });

  if (!existingProject) {
    return null;
  }

  const updatedProject = await prisma.donationProject.update({
    where: {
      id: projectId,
    },
    data: {
      ...data,
    },
    include: {
      project_manager: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return updatedProject;
};

export const createDonationProject = async (
  managerId: string,
  data: CreateDonationProjectInput
) => {
  const { objectivesList, ...projectData } = data;

  const project = await prisma.donationProject.create({
    data: {
      ...projectData,
      managedBy: managerId,
      submissionStatus: SubmissionStatus.draft, // New projects start as draft
      approvalStatus: ProjectApprovalStatus.pending, // Awaiting approval
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
      project_manager: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return project;
};

