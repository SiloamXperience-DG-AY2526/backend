import * as generalModel from '../models/general.model';

export const getVolProjects = async () => {
  const projectDetails = await generalModel.getVolProjects();
  return projectDetails;
};