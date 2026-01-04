import * as volunteerModel from '../models/volunteer.model';
import { GetAvailableVolunteerActivitiesInput, SubmitVolunteerApplicationInput, UpdateVolunteerProjectInput,
  CreateVolunteerProjectInput,
  ProposeVolunteerProjectInput,UpdateVolunteerProposalInput } from '../schemas/volunteer/index';
import { NotFoundError } from '../utils/errors';
//partner
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
export const proposeVolunteerProject = async (
  input: ProposeVolunteerProjectInput & { proposerId: string }
) => {
  return volunteerModel.proposeVolunteerProjectModel(input);
};

export const updateVolunteerProposal = async (input: {
  projectId: string;
  userId: string;
  payload: Omit<UpdateVolunteerProposalInput, 'userId'>;
}) => {
  return volunteerModel.updateVolunteerProposalModel(input);
};

export const withdrawVolunteerProposal = async (input: {
  projectId: string;
  userId: string;
}) => {
  return volunteerModel.withdrawVolunteerProposalModel(input);
};

//admin

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

