import { Request, Response } from 'express';
import * as donationProjectService from '../services/donationProject.service';
import { getUserIdFromRequest } from '../utils/user';
import {
  getDonationProjectsSchema,
} from '../schemas/index';

/**
 * Controller: Get all donation projects
 * GET /donation-projects?type=ongoing|specific|all&page=1&limit=20
 */
export const getDonationProjects = async (req: Request, res: Response) => {
  const filters = getDonationProjectsSchema.parse({
    type: req.query.type,
    page: req.query.page,
    limit: req.query.limit,
  });

  const result = await donationProjectService.getDonationProjects(filters);
  res.json(result);
};

export const getMyDonationProjects = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const projects = await donationProjectService.getMyDonationProjects(managerId);
  res.json(projects);
};

export const getMyDonationProjectDetails = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const project = await donationProjectService.getMyDonationProjectDetails(
    projectId,
    managerId
  );
  res.json(project);
};

export const getProjectDonationTransactions = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const donations = await donationProjectService.getProjectDonationTransactions(
    projectId
  );

  res.json(donations);
};

export const createDonationProject = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const project = await donationProjectService.createDonationProject(
    managerId,
    req.body
  );
  res.status(201).json(project);
};

export const updateDonationProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const updatedProject = await donationProjectService.updateDonationProject(
    projectId,
    managerId,
    req.body
  );
  res.json(updatedProject);
};

export const getProposedProjects = async (req: Request, res: Response) => {
  const proposedProjects = await donationProjectService.getProposedProjects();

  res.json(proposedProjects);
};

export const updateProposedProjectStatus = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const { status } = req.body;

  await donationProjectService.updateProposedProjectStatus({
    projectId,
    status,
  });

  res.status(204).send();
};

export const duplicateDonationProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const duplicated = await donationProjectService.duplicateDonationProject(
    projectId,
    managerId
  );
  res.status(201).json({
    status: 'success',
    message: 'Donation project duplicated',
    data: duplicated,
  });
};