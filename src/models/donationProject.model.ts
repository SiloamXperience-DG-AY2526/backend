import { prisma } from '../lib/prisma';
import { PMPublicSelect } from '../projections/user.projections';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';
import { SubmissionStatus, ProjectApprovalStatus, ProjectType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { Pagination } from './types';
import { DonationProjectPublicSelect } from '../projections/donationProject.projections';

const receivedDonationFilter = {
  submissionStatus: 'submitted',
  receiptStatus: 'received',
} as const;
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
      ...receivedDonationFilter,
      projectId: { in: projectIds },
    },
    _sum: {
      amount: true,
    },
  });

  // Map total raised donations to projects
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

export const getProjectDonationTransactions = async (projectId: string) => {
  const donations = await prisma.donationTransaction.findMany({
    where: {
      id: projectId,
    },
  });
  return donations;
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

export const getMyDonationProject = async (
  projectId: string,
  managerId: string
) => {
  const [project, totalRaised] = await Promise.all([
    prisma.donationProject.findFirst({
      where: {
        id: projectId,
        managedBy: managerId,
      },
      include: {
        project_manager: {
          select: PMPublicSelect,
        },
        objectivesList: {
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.donationTransaction.aggregate({
      where: {
        projectId,
        ...receivedDonationFilter,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    project,
    totalRaised: totalRaised._sum.amount ?? 0,
  };
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
        select: PMPublicSelect,
      },
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return project;
};

export const getProposedProjects = async () => {
  const proposedProjects = await prisma.donationProject.findMany({
    where: {
      type: ProjectType.partnerLed,
      submissionStatus: SubmissionStatus.submitted,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      project_manager: {
        select: PMPublicSelect,
      },
    },
  });
  return proposedProjects;
};

export const updateProposedProjectStatus = async (data: {
  projectId: string;
  status: ProjectApprovalStatus;
}) => {
  const existingProject = await prisma.donationProject.findFirst({
    where: {
      id: data.projectId,
    },
  });

  if (!existingProject) {
    return null;
  }

  const updatedProject = await prisma.donationProject.update({
    where: {
      id: data.projectId,
    },
    data: {
      approvalStatus: data.status,
    },
  });

  return updatedProject;
};

export const duplicateDonationProject = async (
  projectId: string,
  newManagerId: string
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.donationProject.findUnique({
      where: { id: projectId },
      select: {
        title: true,
        location: true,
        about: true,
        objectives: true,
        beneficiaries: true,
        initiatorName: true,
        organisingTeam: true,
        targetFund: true,
        brickSize: true,
        deadline: true,
        type: true,
        startDate: true,
        endDate: true,
        image: true,
        attachments: true,
        objectivesList: {
          select: {
            objective: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!existing) return null;

    const { objectivesList, ...projectData } = existing;

    const duplicated = await tx.donationProject.create({
      data: {
        ...projectData,
        managedBy: newManagerId,
        title: `${existing.title} (Copy)`,
        submissionStatus: SubmissionStatus.draft,
        approvalStatus: ProjectApprovalStatus.pending,
        approvalNotes: null,
        objectivesList: objectivesList.length
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
          select: PMPublicSelect,
        },
        objectivesList: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return duplicated;
  });
};