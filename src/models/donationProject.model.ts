import { prisma } from '../lib/prisma';
import { PMPublicSelect } from '../projections/user.projections';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';
import { SubmissionStatus, ProjectApprovalStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { Pagination } from './types';
import { DonationProjectPublicSelect } from '../projections/donationProject.projections';

/**
 * Get all published donation projects for partners to view
 * Filters by approval status and allows filtering by type (ongoing/specific)
 */
export const getDonationProjects = async (
  where: Prisma.DonationProjectWhereInput,
  pagination: Pagination
) => {
  const [projects, totalCount] = await Promise.all([
    prisma.donationProject.findMany({
      where,
      select: DonationProjectPublicSelect,
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.donationProject.count({ where }),
  ]);

  // Get total raised for each project
  const projectIds = projects.map((p) => p.id);
  const donationSums = await prisma.donationTransaction.groupBy({
    by: ['projectId'],
    where: {
      submissionStatus: 'submitted',
      receiptStatus: 'received',
      projectId: { in: projectIds },
    },
    _sum: {
      amount: true,
    },
  });

  // Map donations to projects
  const donationMap = new Map(
    donationSums.map((d) => [d.projectId, d._sum.amount])
  );

  const projectsWithTotals = projects.map((project) => ({
    ...project,
    totalRaised: donationMap.get(project.id) ?? new Prisma.Decimal(0),
  }));

  return {
    projectsWithTotals,
    totalCount,
  };
};

export const getDonationProjectsByManager = async (managerId: string) => {
  const projects = await prisma.donationProject.findMany({
    where: {
      managedBy: managerId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      project_manager: {
        select: PMPublicSelect
      },
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
      project_manager: {
        select: PMPublicSelect
      },
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
      project_manager: {
        select: PMPublicSelect,
      },
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
      project_manager: {
        select: PMPublicSelect
      },
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return project;
};
