import { prisma } from '../lib/prisma';
import { PMPublicSelect } from './projectionSchemas/user.projections';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';
import { SubmissionStatus, ProjectApprovalStatus, ProjectType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { Pagination } from './types';
import { DonationProjectPublicSelect } from './projectionSchemas/donationProject.projections';

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

export const getProjectDonationTransactions = async (
  projectId: string,
  pagination: Pagination
) => {
  const [donations, totalCount] = await Promise.all([
    prisma.donationTransaction.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        date: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.donationTransaction.count({
      where: {
        projectId: projectId,
      },
    }),
  ]);
  
  return {
    donations,
    totalCount,
  };
};

export const getProjectDonors = async (
  projectId: string,
  pagination: Pagination
) => {
  // Query users who have made donations to this project
  const whereClause: Prisma.UserWhereInput = {
    donorTransactions: {
      some: {
        projectId: projectId,
        submissionStatus: 'submitted',
        receiptStatus: 'received',
      },
    },
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        partner: {
          select: {
            id: true,
            dob: true,
            contactNumber: true,
            countryCode: true,
            gender: true,
          },
        },
        donorTransactions: {
          where: {
            projectId: projectId,
            submissionStatus: 'submitted',
            receiptStatus: 'received',
          },
          select: {
            amount: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.user.count({
      where: whereClause,
    }),
  ]);

  // Calculate cumulative donation amount for each donor
  const donors = users.map((user) => {
    const totalDonated = user.donorTransactions.reduce(
      (sum, transaction) => sum.add(transaction.amount),
      new Prisma.Decimal(0)
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      gender: user.partner?.gender || null,
      contactNumber: user.partner?.contactNumber || null,
      countryCode: user.partner?.countryCode || null,
      totalDonated,
      partner: user.partner
        ? {
          id: user.partner.id,
          dob: user.partner.dob,
        }
        : null,
      createdAt: user.createdAt,
    };
  });
  
  return {
    donors,
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
      projectManager: {
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
        projectManager: {
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

export const getDonationProjectById = async (projectId: string) => {
  const [project, totalRaised] = await Promise.all([
    prisma.donationProject.findFirst({
      where: {
        id: projectId,
        OR: [
          // All non-draft projects
          { submissionStatus: { not: SubmissionStatus.draft } },
          // Draft projects created by non-partner roles
          {
            AND: [
              { submissionStatus: SubmissionStatus.draft },
              { projectManager: { role: { not: 'partner' } } },
            ],
          },
        ],
      },
      include: {
        projectManager: {
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
      projectManager: {
        select: PMPublicSelect,
      },
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return updatedProject;
};

/**
 * Withdraw a donation project proposal
 * Only allows withdrawal if project is owned by the manager and not yet approved
 */
export const withdrawDonationProject = async (
  projectId: string,
  managerId: string,
  reason?: string
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

  // Can only withdraw if not yet approved
  if (existingProject.approvalStatus === ProjectApprovalStatus.approved) {
    throw new Error('Cannot withdraw an approved project');
  }

  const withdrawnProject = await prisma.donationProject.update({
    where: {
      id: projectId,
    },
    data: {
      submissionStatus: SubmissionStatus.withdrawn,
      approvalNotes: reason || existingProject.approvalNotes,
    },
    include: {
      projectManager: {
        select: PMPublicSelect,
      },
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return withdrawnProject;
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
      projectManager: {
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
      projectManager: {
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
        projectManager: {
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
