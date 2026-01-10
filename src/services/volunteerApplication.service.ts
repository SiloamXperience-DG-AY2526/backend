import * as volunteerModel from '../models/volunteerApplication.model';
import { GetVolunteerApplicationsInput, SubmitVolApplicationInput, AnyVolApplicationsQueryInput } from '../schemas';
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
