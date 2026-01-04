import * as donationModel from '../models/donation.model';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';
import { NotFoundError } from '../utils/errors';

export const getDonationProjects = async (managerId: string) => {
  const projects = await donationModel.getDonationProjectsByManager(managerId);
  return projects;
};

export const getDonationProjectDetails = async (
  projectId: string,
  managerId: string
) => {
  const project = await donationModel.getDonationProjectById(
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
  const updatedProject = await donationModel.updateDonationProject(
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
  const project = await donationModel.createDonationProject(managerId, data);
  return project;
};

