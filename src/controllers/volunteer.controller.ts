import { Request, Response } from 'express';
import * as volunteerService from '../services/volunteer.service';
import { getUserIdFromRequest } from '../utils/user';

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

