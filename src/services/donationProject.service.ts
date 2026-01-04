import * as donationProjectModel from '../models/donationProject.model';
import {
  GetDonationProjectsInput,
} from '../schemas/index';
import { NotFoundError } from '../utils/errors';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';

/**
 * Service: Get all donation projects for partners
 * Handles business logic for filtering and pagination
 */
export const getDonationProjects = async (filters: GetDonationProjectsInput) => {
  return await donationProjectModel.getDonationProjects(filters);
};

export const getMyDonationProjects = async (managerId: string) => {
  const projects = await donationProjectModel.getDonationProjectsByManager(managerId);
  return projects;
};

export const getDonationProjectDetails = async (
  projectId: string,
  managerId: string
) => {
  const project = await donationProjectModel.getDonationProjectById(
    projectId,
    managerId
  );

  if (!project) {
    throw new NotFoundError(`Donation Project ${projectId} Not Found!`);
  }

  return project;
};

export const updateDonationProject = async (
  projectId: string,
  managerId: string,
  data: UpdateDonationProjectInput
) => {
  const updatedProject = await donationProjectModel.updateDonationProject(
    projectId,
    managerId,
    data
  );

  if (!updatedProject) {
    throw new NotFoundError(`Donation Project ${projectId} Not Found!`);
  }

  return updatedProject;
};

export const createDonationProject = async (
  managerId: string,
  data: CreateDonationProjectInput
) => {
  const project = await donationProjectModel.createDonationProject(managerId, data);
  return project;
};

