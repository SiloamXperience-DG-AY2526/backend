import { Request, Response } from 'express';
import * as volunteerService from '../services/volunteer.service';
import { getUserIdFromRequest } from '../utils/user';
import { GetAvailableVolunteerActivitiesSchema, GetVolunteerApplicationsQuerySchema  } from '../schemas/project';


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

//partner
export const submitVolunteerApplication = async (
  req: Request,
  res: Response
) => {
  // const userId = req.user.id;change to get from auth middleware
  const { projectId } = req.params;
  const application =
    await volunteerService.submitVolunteerApplication({
      projectId, 
      ...req.body,
      
    });
  // res.status(201).json(application);
  // Respond with success
  return res.status(201).json({
    status: 'success',
    message: 'Volunteer application submitted successfully',
    data: application,
  });

};

export const getVolunteerApplications = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params; // get from user token

  const { status } = GetVolunteerApplicationsQuerySchema.parse(req.query);

  const applications =
    await volunteerService.getVolunteerApplications({
      userId,
      status, 
    });

  return res.status(200).json({
    status: 'success',
    data: applications,
  });
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

export const proposeVolunteerProject = async (
  req: Request,
  res: Response
) => {
  const { userId, ...projectData } = req.body;

  if (!userId) {
    throw new Error('USER_ID_REQUIRED');
  }

  const project = await volunteerService.proposeVolunteerProject({
    ...projectData,
    proposerId: userId,
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
  const { projectId } = req.params;
  const { userId, ratings, feedback } = req.body;

  if (!userId) throw new Error('USER_ID_REQUIRED');

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