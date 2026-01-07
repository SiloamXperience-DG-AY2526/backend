import { prisma } from '../lib/prisma';
import { ProjectApprovalStatus } from '@prisma/client';

const managerInfo = {
  select: {
    id: true,
    title: true,
    firstName: true,
    lastName: true,
  },
} as const;

export const getVolProjects = async () => {
  const projectDetails = await prisma.volunteerProject.findMany({
    orderBy: { title: 'desc' },
    where: {
      OR: [
        { approvalStatus: ProjectApprovalStatus.pending },
        { approvalStatus: ProjectApprovalStatus.reviewing },
      ],
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      location: true,
      initiatorName: true,
      organisingTeam: true,
      approvalStatus: true,
      managedBy: managerInfo
    }
  });

  return projectDetails;
};

export const getVolProject = async (projectId: string) => {
  return prisma.volunteerProject.findUnique({
    where: { id: projectId },
    include: {
      managedBy: true,
      approvedBy: true
    },
  });
};



export const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

export const updateVolProjectStatus = async (
  projectId: string,
  data: {
        approvalStatus: ProjectApprovalStatus;
        approvedById?: string | null;
    }
) => {
  return prisma.volunteerProject.update({
    where: { id: projectId },
    data,
    include: {
      managedBy: true,
      approvedBy: true
    },
  });
};
