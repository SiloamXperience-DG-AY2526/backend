import { prisma } from '../lib/prisma';
import { PartnerFeedbackType, ProjectApprovalStatus } from '@prisma/client';
import { StaffProfile } from '../schemas/user';
import { BadRequestError } from '../utils/errors';
import { PMPublicSelect } from './projectionSchemas/user.projections';


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


export const getPeerFeedbackForProject = async (projectId: string) => {
  return prisma.peerFeedback.findMany({
    where: {
      projectId,
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
export const getStaffProfile = async (
  userId: string
): Promise<StaffProfile | null> => {
  const staff = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      title: true,
      email: true,
    },
  });

  if (!staff) throw new BadRequestError('Error retrieving staff profile');

  return {
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    title: staff.title ?? undefined,
  };
};

export async function updateStaffProfile(
  userId: string,
  newStaffProfile: StaffProfile
) {

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...newStaffProfile,
    },
  });

  const updatedProfile = await getStaffProfile(userId);
  
  return updatedProfile;
}
