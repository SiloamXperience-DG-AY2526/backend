import { prisma } from '../lib/prisma';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';
import { SubmissionStatus, ProjectApprovalStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

// Common select for project manager public info
const pmPublicInfo = {
  select: {
    id: true,
    title: true,
    firstName: true,
    lastName: true,
  },
} as const;


/**
 * Get all published donation projects for partners to view
 * Filters by approval status and allows filtering by type (ongoing/specific)
 */
export const getDonationProjects = async (filters: {
  type?: 'ongoing' | 'specific' | 'all';
  page: number;
  limit: number;
}) => {
  const { type = 'all', page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    approvalStatus: 'approved',
    submissionStatus: 'submitted',
  };

  // Filter by type: ongoing (no target/deadline) vs specific (has target/deadline)
  if (type === 'ongoing') {
    where.targetFund = null;
    where.deadline = null;
  } else if (type === 'specific') {
    where.AND = [
      { targetFund: { not: null } },
      // Note: deadline is optional even for specific projects per requirements
    ];
  }

  const [projects, totalCount] = await Promise.all([
    prisma.donationProject.findMany({
      where,
      select: {
        id: true,
        title: true,
        location: true,
        about: true,
        objectives: true,
        beneficiaries: true,
        targetFund: true,
        brickSize: true,
        deadline: true,
        type: true,
        startDate: true,
        endDate: true,
        image: true,
        attachments: true,
        initiatorName: true,
        organisingTeam: true,
        project_manager: pmPublicInfo,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.donationProject.count({ where }),
  ]);

  // Get total raised for each project
  const projectIds = projects.map((p) => p.id);
  const donationSums = await prisma.donationTransaction.groupBy({
    by: ['projectId'],
    where: {
      projectId: { in: projectIds },
      submissionStatus: 'submitted',
      receiptStatus: 'received',
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
    // Determine if project is ongoing or specific
    isOngoing: project.targetFund === null && project.deadline === null,
  }));

  return {
    projects: projectsWithTotals,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

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
