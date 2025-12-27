import {
  submitVolunteerApplicationModel,
  getVolunteerApplicationsModel,
  getAvailableVolunteerActivitiesModel,
} from '../models/volunteerModel';
import {  GetVolunteerApplicationsInput, GetVolunteerApplicationsOutput, GetAvailableVolunteerActivities, PaginatedVolunteerActivities } from '../schemas/volunteer';


// Service for submitting application
export const submitVolunteerApplicationService = async (
  userId: string,
  projectId: string,
  projectPositionId: string
) => {
  return await submitVolunteerApplicationModel({
    userId,
    projectId,
    projectPositionId,
  });
};


// Service for fetching volunteer applications
export const getVolunteerApplicationsService = async (
  params: GetVolunteerApplicationsInput
): Promise<GetVolunteerApplicationsOutput> => {
  const { userId } = params;
  return await getVolunteerApplicationsModel(userId);
};

export const getAvailableVolunteerActivitiesService = async (
  query: GetAvailableVolunteerActivities
): Promise<PaginatedVolunteerActivities> => {
  const { page = 1, limit = 10, search } = query;

  if (page < 1 || limit < 1) {
    throw new Error('INVALID_PAGINATION');
  }

  return getAvailableVolunteerActivitiesModel({ page, limit, search });
};