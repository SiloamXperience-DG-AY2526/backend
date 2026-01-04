import { Request, Response } from 'express';
import * as donationService from '../services/donation.service';
import { getUserIdFromRequest } from '../utils/user';

export const getDonationProjects = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const projects = await donationService.getDonationProjects(managerId);
  res.json(projects);
};

export const getDonationProjectDetails = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const project = await donationService.getDonationProjectDetails(
    projectId,
    managerId
  );
  res.json(project);
};

export const createDonationProject = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const project = await donationService.createDonationProject(
    managerId,
    req.body
  );
  res.status(201).json(project);
};

export const updateDonationProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const updatedProject = await donationService.updateDonationProject(
    projectId,
    managerId,
    req.body
  );
  res.json(updatedProject);
};

