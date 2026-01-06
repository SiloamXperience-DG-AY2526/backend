import { prisma } from '../lib/prisma';

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
        { approvalStatus: prisma.ProjectApprovalStatus.pending },
        { approvalStatus: prisma.ProjectApprovalStatus.reviewing },
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
      managedBy: managerInfo,

    }
  });

  return projectDetails;
};
export const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};
