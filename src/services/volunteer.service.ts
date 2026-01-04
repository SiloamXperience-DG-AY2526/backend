import * as volunteerModel from '../models/volunteerModel';
import { GetAvailableVolunteerActivitiesInput, SubmitVolunteerApplicationInput } from '../schemas/volunteer/index';

interface SubmitVolunteerApplicationServiceInput
  extends SubmitVolunteerApplicationInput {
  userId: string;
  projectId: string;
}

export const submitVolunteerApplication = async (
  input: SubmitVolunteerApplicationServiceInput
) => {
  return volunteerModel.submitVolunteerApplication({
    userId: input.userId,
    projectId: input.projectId,
    positionId: input.positionId,
    sessionId: input.sessionId,
  });
};


interface GetVolunteerApplicationsServiceInput {
  userId: string;
  status?: 'reviewing' | 'approved' | 'rejected' | 'active' | 'inactive';
}

export const getVolunteerApplications = async (
  input: GetVolunteerApplicationsServiceInput
) => {
  return volunteerModel.getVolunteerApplicationsModel(input);
};
export const getAvailableVolunteerActivities = async (
  input: GetAvailableVolunteerActivitiesInput
) => {
  return volunteerModel.getAvailableVolunteerActivitiesModel(input);
};