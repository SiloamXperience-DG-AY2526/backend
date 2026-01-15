import * as volunteerModel from '../models/volunteerApplication.model';
import { GetVolunteerApplicationsInput, SubmitVolApplicationInput, AnyVolApplicationsQueryInput, MatchVolunteerToProjectInput, ApproveVolunteerMatchInput } from '../schemas';
import { NotImplementedError, ValidationError } from '../utils/errors';

//TODO
export const getVolunteerApplications = async (
  _filters: AnyVolApplicationsQueryInput
) => {
  throw new NotImplementedError('501 Not Implemented');
};

export const getMyVolunteerApplications = async (
  input: GetVolunteerApplicationsInput
) => {
  return volunteerModel.getVolunteerApplicationsModel(input);
};

export const submitVolunteerApplication = async (
  input: SubmitVolApplicationInput
) => {
  const {hasConsented} = input.applicationDetails;
  if (!hasConsented) {
    throw new ValidationError('User\'s consent is required', {
      hasConsented: 'You must agree before submitting an application',
    });
  }
  
  return volunteerModel.submitVolunteerApplication(input);
};

export const matchVolunteerToProject = async (
  input: MatchVolunteerToProjectInput
) => {
  return volunteerModel.matchVolunteerToProject(input);
};

export const approveVolunteerMatch = async (
  matchId: string,
  approverId: string,
  data: ApproveVolunteerMatchInput
) => {
  return volunteerModel.approveVolunteerMatch(matchId, approverId, data);
};
