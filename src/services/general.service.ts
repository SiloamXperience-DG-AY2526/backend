import { ProjectApprovalStatus, PartnerFeedbackType, UserRole } from '@prisma/client';
import * as generalModel from '../models/general.model';
import { findUserByIdWithRoles } from '../models/partner.model';

export const getVolProjects = async () => {
  const projectDetails = await generalModel.getVolProjects();
  return projectDetails;
};


export const updateVolProjectStatus = async (
  projectId: string,
  managerId: string,
  status: ProjectApprovalStatus
) => {

  // Get current project
  const project = await generalModel.getVolProject(projectId);

  if (!project) {
    throw new Error('Project not found');
  }

  if (project.managedById !== managerId) {
    throw new Error('Unauthorized: You do not manage this project');
  }

  const prevStatus = project.approvalStatus;

  const data: {
        approvalStatus: ProjectApprovalStatus;
        approvedById?: string | null;
    } = { approvalStatus: status };

  if (status === ProjectApprovalStatus.approved) {
    data.approvedById = managerId;
  } else if (prevStatus === ProjectApprovalStatus.approved) {
    data.approvedById = null;
  }

  return generalModel.updateVolProjectStatus(projectId, data);
};



export const submitPeerFeedback = async (
  feedbackData: {
        feedbackType: 'supervisor' | 'peer' | 'self';
        reviewerName: string;
        revieweeName: string;
        score: number;
        strengths?: string | null;
        improvements?: string | null;
        projectId: string;
    },
  userId: string
) => {

  // Look up reviewer
  const reviewer = await generalModel.findUserByName(feedbackData.reviewerName);
  if (!reviewer) {
    throw new Error('Reviewer not found');
  }

  // Make sure reviewer is user
  if (reviewer.id !== userId) {
    throw new Error('Unauthorized: You can only submit feedback as yourself');
  }

  // Look up reviewee
  const reviewee = await generalModel.findUserByName(feedbackData.revieweeName);
  if (!reviewee) {
    throw new Error('Reviewee not found');
  }

  // Map enum type to PartnerFeedbackType
  const feedbackTypeMap: Record<string, PartnerFeedbackType> = {
    'supervisor': PartnerFeedbackType.supervisor,
    'peer': PartnerFeedbackType.peer,
    'self': PartnerFeedbackType.self,
  };


  const feedbackDetail = await generalModel.submitPeerFeedback({
    feedbackType: feedbackTypeMap[feedbackData.feedbackType],
    reviewerId: reviewer.id,
    revieweeId: reviewee.id,
    score: feedbackData.score,
    strengths: feedbackData.strengths,
    improvements: feedbackData.improvements,
    projectId: feedbackData.projectId,
  });

  return feedbackDetail;
};

export const getAllPeerFeedback = async (userId: string) => {
  try {
    const user = await findUserByIdWithRoles(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === UserRole.generalManager) {
      return await generalModel.getAllPeerFeedback();
    }

    return await generalModel.getPeerFeedbackByManager(userId);
  } catch {
    throw new Error('Feedback cannot be retrived.');
  }
};