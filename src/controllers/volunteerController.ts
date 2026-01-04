import { Request, Response } from 'express';

import * as volunteerService from '../services/volunteer.service';
import { GetAvailableVolunteerActivitiesSchema, GetVolunteerApplicationsQuerySchema  } from '../schemas/volunteer';



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