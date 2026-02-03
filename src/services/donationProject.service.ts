import * as donationProjectModel from '../models/donationProject.model';
import {
  GetDonationProjectsInput,
} from '../schemas/index';
import { NotFoundError } from '../utils/errors';
import {
  UpdateDonationProjectInput,
  CreateDonationProjectInput,
} from '../schemas/donation';
import { buildPagination, calculateSkip } from './paginationHelper';
import { Prisma, ProjectApprovalStatus, SubmissionStatus } from '@prisma/client';

/**
 * Service: Get all donation projects
 * For partners: only approved projects
 * For admins/managers: all non-partner-draft projects
 */
export const getDonationProjects = async (filters: GetDonationProjectsInput & { viewerRole?: string }) => {
  const { type, page = 1, limit = 20, viewerRole } = filters;
  const skip = calculateSkip(page, limit);

  // Build where clause filter based on viewer role
  let where: Prisma.DonationProjectWhereInput;

  if (viewerRole === 'partner') {
    // Partners only see approved, non-draft projects
    where = {
      type: type,
      submissionStatus: { not: SubmissionStatus.draft },
      approvalStatus: ProjectApprovalStatus.approved,
    };
  } else {
    // Admins/managers see all except partner drafts
    where = {
      type: type,
      OR: [
        // All non-draft projects
        { submissionStatus: { not: SubmissionStatus.draft } },
        // Draft projects created by non-partner roles
        {
          AND: [
            { submissionStatus: SubmissionStatus.draft },
            { projectManager: { role: { not: 'partner' } } },
          ],
        },
      ],
    };
  }

  const {projectsWithTotals: projects, totalCount} = await donationProjectModel.getDonationProjects(where, {skip, limit});

  return {
    projects,
    pagination: buildPagination(page, limit, totalCount)
  };

};

export const getProjectDonationTransactions = async (
  projectId: string,
  pagination: { page: number; limit: number }
) => {
  const { page, limit } = pagination;
  const skip = calculateSkip(page, limit);
  
  const { donations, totalCount } = await donationProjectModel.getProjectDonationTransactions(
    projectId,
    { skip, limit }
  );
  
  return {
    donations,
    pagination: buildPagination(page, limit, totalCount),
  };
};

export const getProjectDonors = async (
  projectId: string,
  pagination: { page: number; limit: number }
) => {
  const { page, limit } = pagination;
  const skip = calculateSkip(page, limit);

  const { donors, totalCount } = await donationProjectModel.getProjectDonors(
    projectId,
    { skip, limit }
  );

  return {
    donors,
    pagination: buildPagination(page, limit, totalCount),
  };
};

// Get donor summary for project owners (without amounts)
export const getProjectDonorsSummary = async (
  projectId: string,
  userId: string
) => {
  return donationProjectModel.getProjectDonorsSummary(projectId, userId);
};

export const getMyDonationProjects = async (managerId: string) => {
  const projects = await donationProjectModel.getDonationProjectsByManager(managerId);
  return projects;
};

export const getMyDonationProjectDetails = async (
  projectId: string,
  managerId: string
) => {
  const project = await donationProjectModel.getMyDonationProject(
    projectId,
    managerId
  );

  if (!project) {
    throw new NotFoundError(`Donation Project ${projectId} Not Found!`);
  }
  return project;
};

//finance manager
export const getDonationProjectDetails = async (projectId: string) => {
  const project = await donationProjectModel.getDonationProjectById(projectId);
  console.log(project);
  if (!project.project) {
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

export const updateDonationProjectById = async (
  projectId: string,
  data: UpdateDonationProjectInput
) => {
  const updatedProject = await donationProjectModel.updateDonationProjectById(
    projectId,
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

export const getProposedProjects = async () => {
  return await donationProjectModel.getProposedProjects();
};

export const updateProposedProjectStatus = async (data: {
  projectId: string;
  status: ProjectApprovalStatus;
}) => {
  const updatedProposedProjectStatus = await donationProjectModel.updateProposedProjectStatus(data);
  
  if (!updatedProposedProjectStatus) {
    throw new NotFoundError(`Proposed Donation Project ${data.projectId} Not Found!`);
  }

  return updatedProposedProjectStatus;
};

/**
 * Service: Withdraw a donation project proposal
 * Partners can withdraw their proposed projects before approval
 */
export const withdrawDonationProject = async (
  projectId: string,
  managerId: string,
  reason?: string
) => {
  const withdrawnProject = await donationProjectModel.withdrawDonationProject(
    projectId,
    managerId,
    reason
  );

  if (!withdrawnProject) {
    throw new NotFoundError(`Donation Project ${projectId} Not Found!`);
  }

  return withdrawnProject;
};
export const duplicateDonationProject = async (
  projectId: string,
  newManagerId: string
) => {
  const duplicated = await donationProjectModel.duplicateDonationProject(
    projectId,
    newManagerId
  );

  if (!duplicated) {
    throw new NotFoundError(`Donation Project ${projectId} Not Found!`);
  }

  return duplicated;
};
