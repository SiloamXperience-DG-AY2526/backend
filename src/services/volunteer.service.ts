import * as volunteerModel from '../models/volunteer.model';
import {
  UpdateVolunteerProjectInput,
  CreateVolunteerProjectInput,
} from '../schemas/volunteer';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const getVolunteerProjects = async (managerId: string) => {
  const projects = await volunteerModel.getVolunteerProjectsByManager(managerId);
  return projects;
};

export const getVolunteerProjectDetails = async (
  projectId: string,
  managerId: string
) => {
  const project = await volunteerModel.getVolunteerProjectById(
    projectId,
    managerId
  );

  if (!project) {
    throw new NotFoundError(`Volunteer Project ${projectId} Not Found!`);
  }

  return project;
};

export const updateVolunteerProject = async (
  projectId: string,
  managerId: string,
  data: UpdateVolunteerProjectInput
) => {
  const updatedProject = await volunteerModel.updateVolunteerProject(
    projectId,
    managerId,
    data
  );

  if (!updatedProject) {
    throw new NotFoundError(`Volunteer Project ${projectId} Not Found!`);
  }

  return updatedProject;
};

export const createVolunteerProject = async (
  managerId: string,
  data: CreateVolunteerProjectInput
) => {
  const project = await volunteerModel.createVolunteerProject(managerId, data);
  return project;
};

