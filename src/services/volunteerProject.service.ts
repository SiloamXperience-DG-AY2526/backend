import { ProjectApprovalStatus } from '@prisma/client';
import * as volunteerModel from '../models/volunteerProject.model';
import {
  GetAvailableVolunteerActivitiesInput, UpdateVolunteerProjectInput,
  CreateVolunteerProjectInput, ProposeVolunteerProjectInput, UpdateVolunteerProposalInput,
  MyProjectApplicationsInput,
  GetAllVolunteerProjectsInput,
} from '../schemas/project';
import { NotFoundError, NotImplementedError } from '../utils/errors';


export const getVolProjectApplications = async (
  _input: MyProjectApplicationsInput
) => {
  throw new NotImplementedError('501 Not Implemented');
};

export const getAvailableVolunteerActivities = async (
  input: GetAvailableVolunteerActivitiesInput
) => {
  return volunteerModel.getAvailableVolunteerActivitiesModel(input);
};

export const getAllVolunteerProjects = async (
  input: GetAllVolunteerProjectsInput & { viewerRole?: string }
) => {
  return volunteerModel.getAllVolunteerProjectsModel(input);
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
export const getVolunteerProjectDetail = async (input: { projectId: string }) => {
  return volunteerModel.getVolunteerProjectDetailModel(input);
};

export const submitVolunteerFeedback = async (input: {
    projectId: string;
    userId: string;
    ratings: {
        overall: number;
        management: number;
        planning: number;
        facilities: number;
    };
    feedback: {
        experience: string;
        improvement: string;
        comments?: string | null;
    };
   
}) => {
  return volunteerModel.submitVolunteerFeedbackModel(input);
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

export const updateVolunteerProjectById = async (
  projectId: string,
  data: UpdateVolunteerProjectInput
) => {
  const updatedProject = await volunteerModel.updateVolunteerProjectById(
    projectId,
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

export const duplicateVolunteerProject = async (
  projectId: string,
  newManagerId: string
) => {
  const duplicated = await volunteerModel.duplicateVolunteerProject(
    projectId,
    newManagerId
  );

  if (!duplicated) {
    throw new NotFoundError(`Volunteer Project ${projectId} Not Found!`);
  }

  return duplicated;
};

export const updateVolProjectStatus = async (
  projectId: string,
  userId: string,
  status: ProjectApprovalStatus
) => {

  // Get current project
  const project = await volunteerModel.getVolProject(projectId);

  if (!project) {
    throw new NotFoundError(`Volunteer Project ${projectId} Not Found!`);
  }

  const prevStatus = project.approvalStatus;

  const data: {
        approvalStatus: ProjectApprovalStatus;
        approvedById?: string | null;
    } = { approvalStatus: status };

  if (status === ProjectApprovalStatus.approved) {
    data.approvedById = userId;
  } else if (prevStatus === ProjectApprovalStatus.approved) {
    data.approvedById = null;
  }

  return volunteerModel.updateVolProjectStatus(projectId, data);
};

export const viewMyProposedProjects = async (input: {
  userId: string;
  filters?: { approvalStatus?: ProjectApprovalStatus };
}) => {
  return volunteerModel.viewMyProposedProjectsModel(input);
};

export const updateMyProposedProjectStatus = async (input: {
  userId: string;
  projectId: string;
  approvalStatus: ProjectApprovalStatus;
}) => {
  return volunteerModel.updateMyProposedProjectStatusModel(input);
};
