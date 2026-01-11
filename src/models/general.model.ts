import { prisma } from '../lib/prisma';
import { PartnerFeedbackType, ProjectApprovalStatus } from '@prisma/client';
import { PMPublicSelect } from '../projections/user.projections';

const managerInfo = {
  select: {
    title: true,
    PMPublicSelect,
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

export const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};


export const submitPeerFeedback = async (
  feedbackData: {
        feedbackType: PartnerFeedbackType;
        reviewerId: string;
        revieweeId: string;
        score: number;
        strengths?: string | null;
        improvements?: string | null;
        projectId: string;
    }
) => {
  return prisma.peerFeedback.create({
    data: {
      reviewerId: feedbackData.reviewerId,
      revieweeId: feedbackData.revieweeId,
      projectId: feedbackData.projectId,
      score: feedbackData.score,
      type: feedbackData.feedbackType,
      strengths: feedbackData.strengths || '',
      improvements: feedbackData.improvements || '',
    },
    include: {
      reviewer: true,
      reviewee: true,
      project: true,
    },
  });
};

export const findUserByName = async (firstName: string, lastName: string) => {

  return prisma.user.findFirst({
    where: {
      firstName: firstName,
      lastName: lastName,
    },
  });
};

export const getAllPeerFeedback = async () => {
  return prisma.peerFeedback.findMany({
    include: {
      reviewer: true,
      project: true,
      reviewee: true,
      tags: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getPeerFeedbackByManager = async (userId: string) => {
  return prisma.peerFeedback.findMany({
    where: {
      project: {
        managedById: userId,
      },
    },
    include: {
      reviewer: true,
      project: true,
      reviewee: true,
      tags: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
