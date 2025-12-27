import { Request, Response } from 'express';

import { getAvailableVolunteerActivitiesService, getVolunteerApplicationsService, submitVolunteerApplicationService } from '../services/volunteer.service';
import { GetAvailableVolunteerActivitiesSchema, SubmitVolunteerApplicationInput, SubmitVolunteerApplicationSchema } from '../schemas/volunteer';
import { ProjectIdSchema } from '../schemas';

export const submitVolunteerApplication = async (req: Request, res: Response) => {
  const { userId, projectPositionId } = SubmitVolunteerApplicationSchema.parse(req.body);
  const { projectId } = ProjectIdSchema.parse(req.params);


  const result = await submitVolunteerApplicationService(userId, projectId, projectPositionId);


  // Respond with success
  return res.status(201).json({
      status: 'success',
      message: 'Volunteer application submitted successfully',
      ...result,
    });
};



export const getVolunteerApplications = async (req: Request, res: Response) => {
  const { userId } = req.params;

  // validated by middleware, so we can safely use userId
  const result = await getVolunteerApplicationsService({ userId });

  return res.status(200).json(result);
};

export const getAvailableVolunteerActivities = async (req: Request, res: Response) => {
  const query = GetAvailableVolunteerActivitiesSchema.parse(req.query); 

   const result = await getAvailableVolunteerActivitiesService({
    page: query.page,
    limit: query.limit,
    search: query.search,
  });
  res.status(200).json(result);
};