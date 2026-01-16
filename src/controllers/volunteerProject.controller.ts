import { Request, Response } from 'express';
import * as volunteerService from '../services/volunteerProject.service';
import { getUserIdFromRequest } from '../utils/user';
import { GetAvailableVolunteerActivitiesSchema, MyVolApplicationsQueryType } from '../schemas/project';
import { ProjectApprovalStatus } from '@prisma/client';

export const getVolunteerProjects = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const projects = await volunteerService.getVolunteerProjects(managerId);
  res.json(projects);
};

export const getVolunteerProjectDetails = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const project = await volunteerService.getVolunteerProjectDetails(
    projectId,
    managerId
  );
  res.json(project);
};

export const createVolunteerProject = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const project = await volunteerService.createVolunteerProject(
    managerId,
    req.body
  );
  res.status(201).json(project);
};

export const updateVolunteerProject = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const updatedProject = await volunteerService.updateVolunteerProject(
    projectId,
    managerId,
    req.body
  );
  res.json(updatedProject);
};

export const getVolProjectApplications = async (
  req: Request,
  res: Response
) => {
  const userId = getUserIdFromRequest(req);
  const { projectId } = req.params;
  const filters = req.query as MyVolApplicationsQueryType;
  const applications = await volunteerService.getVolProjectApplications(
    {
      userId,
      projectId,
      filters
    }
  );
  return res.status(200).json(applications);
};

export const getAvailableVolunteerActivities = async (
  req: Request,
  res: Response
) => {
  const query = GetAvailableVolunteerActivitiesSchema.parse(req.query);

  const result = await volunteerService.getAvailableVolunteerActivities({
    page: query.page,
    limit: query.limit,
    search: query.search,
  });

  return res.status(200).json({
    status: 'success',
    ...result,
  });
};

export const proposeVolunteerProject = async (req: Request, res: Response) => {
  const proposerId = getUserIdFromRequest(req);

  const project = await volunteerService.proposeVolunteerProject({
    ...req.body,
    proposerId,
  });

  return res.status(201).json({
    status: 'success',
    message: 'Volunteer project proposal created',
    data: project,
  });
};

export const updateVolunteerProposal = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const { userId, ...updateData } = req.body;

  if (!userId) {
    throw new Error('USER_ID_REQUIRED');
  }

  const project = await volunteerService.updateVolunteerProposal({
    projectId,
    userId,
    payload: updateData,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Volunteer project proposal updated',
    data: project,
  });
};
export const withdrawVolunteerProposal = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  if (!userId) throw new Error('USER_ID_REQUIRED');

  const project = await volunteerService.withdrawVolunteerProposal({
    projectId,
    userId,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Volunteer project proposal withdrawn',
    data: project,
  });
};

export const getVolunteerProjectDetail = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const project = await volunteerService.getVolunteerProjectDetail({ projectId });

  return res.status(200).json({
    status: 'success',
    message: 'Volunteer project detail fetched',
    data: project,
  });
};

export const submitVolunteerFeedback = async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { projectId } = req.params;
  const { ratings, feedback } = req.body;

  const result = await volunteerService.submitVolunteerFeedback({
    projectId,
    userId,
    ratings,
    feedback,
  });

  return res.status(201).json({
    status: 'success',
    message: 'Volunteer feedback submitted',
    data: result,
  });
};

export const duplicateVolunteerProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const duplicated = await volunteerService.duplicateVolunteerProject(
    projectId,
    managerId
  );
  return res.status(201).json({
    status: 'success',
    message: 'Volunteer project duplicated',
    data: duplicated,
  });
};

export const updateVolProjectStatus = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { status } = req.body;
  const userId = getUserIdFromRequest(req);

  const updatedProject = await volunteerService.updateVolProjectStatus(
    projectId,
    userId,
        status as ProjectApprovalStatus
  );
  return res.status(200).json({
    status: 'success',
    message: 'Volunteer project status updated',
    data: updatedProject,
  });
};

