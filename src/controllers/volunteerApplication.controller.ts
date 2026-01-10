import { Request, Response } from 'express';
import * as volunteerService from '../services/volunteerApplication.service';
import { getUserIdFromRequest } from '../utils/user';
import { MyVolApplicationsQueryType } from '../schemas';

export const getVolunteerApplications = async (
  req: Request,
  res: Response
) => {
  const filters = req.query as MyVolApplicationsQueryType;
  const applications = await volunteerService.getVolunteerApplications(filters);
  return res.status(200).json(applications);
};

export const getMyVolunteerApplications = async (
  req: Request,
  res: Response
) => {
  const userId  = getUserIdFromRequest(req);
  const filters = req.query as MyVolApplicationsQueryType;
  const applications =
    await volunteerService.getMyVolunteerApplications({
      userId,
      filters, 
    });

  return res.status(200).json(applications);
};

export const submitVolunteerApplication = async (
  req: Request,
  res: Response
) => {
  const userId = getUserIdFromRequest(req);
  const applicationDetails = req.body;
  const application =
    await volunteerService.submitVolunteerApplication({
      userId,
      applicationDetails,
    });
  return res.status(201).json({
    status: 'success',
    message: 'Volunteer application submitted successfully',
    data: application,
  });
};

