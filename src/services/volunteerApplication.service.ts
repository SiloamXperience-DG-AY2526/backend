import * as volunteerModel from '../models/volunteerApplication.model';
import { GetVolunteerApplicationsInput, SubmitVolApplicationInput } from '../schemas';
import { ValidationError } from '../utils/errors';

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
