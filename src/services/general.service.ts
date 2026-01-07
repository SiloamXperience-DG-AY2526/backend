import { ProjectApprovalStatus } from '@prisma/client';
import * as generalModel from '../models/general.model';

export const getVolProjects = async () => {
  const projectDetails = await generalModel.getVolProjects();
  return projectDetails;
};


export const updateVolProjectStatus = async (
  projectId: string,
  managerId: string,
  status: ProjectApprovalStatus
) => {

  // Get current project
  const project = await generalModel.getVolProject(projectId);

  if (!project) {
    throw new Error('Project not found');
  }

  if (project.managedById !== managerId) {
    throw new Error('Unauthorized: You do not manage this project');
  }

  const prevStatus = project.approvalStatus;

  const data: {
        approvalStatus: ProjectApprovalStatus;
        approvedById?: string | null;
    } = { approvalStatus: status };

  if (status === ProjectApprovalStatus.approved) {
    data.approvedById = managerId;
  } else if (prevStatus === ProjectApprovalStatus.approved) {
    data.approvedById = null;
  }
    
  return generalModel.updateVolProjectStatus(projectId, data);
};