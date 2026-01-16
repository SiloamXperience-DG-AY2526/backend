import { PartnerFeedbackType, UserRole } from '@prisma/client';
import * as generalModel from '../models/general.model';
import { findUserByIdWithRoles } from '../models/partner.model';
import { parseName } from '../helpers/parseName';
import { NotFoundError } from '../utils/errors';


export const submitPeerFeedback = async (
  feedbackData: {
        feedbackType: 'supervisor' | 'peer' | 'self';
        reviewer: string;
        reviewee: string;
        score: number;
        strengths?: string | null;
        improvements?: string | null;
        projectId: string;
    }
) => {


  // Look up reviewer
  const reviewerName = parseName(feedbackData.reviewer);
  const reviewer = await generalModel.findUserByName(reviewerName.firstName, reviewerName.lastName);
  if (!reviewer) {
    throw new NotFoundError('Reviewer not found');
  }

  // Look up reviewee
  const revieweeName = parseName(feedbackData.reviewee);
  const reviewee = await generalModel.findUserByName(revieweeName.firstName, revieweeName.lastName);
  if (!reviewee) {
    throw new NotFoundError('Reviewee not found');
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
  const user = await findUserByIdWithRoles(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.role === UserRole.generalManager) {
    return await generalModel.getAllPeerFeedback();
  }

  return await generalModel.getPeerFeedbackByManager(userId);
};

export const getPeerFeedbackForProject = async (projectId: string) => {
  const feedbackList = await generalModel.getPeerFeedbackForProject(projectId);
  return feedbackList;
};
