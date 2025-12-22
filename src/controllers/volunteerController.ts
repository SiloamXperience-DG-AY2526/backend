import { Request, Response } from 'express';
import { submitVolunteerApplicationModel,getVolunteerApplicationsModel, getAvailableVolunteerActivitiesModel } from '../models/volunteerModel';

export const submitVolunteerApplication = async (req: Request, res: Response) => {
  try {
    const { userId, projectId, projectPositionId } = req.body;

    if (!userId || !projectId || !projectPositionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await submitVolunteerApplicationModel({
      userId,
      projectId,
      projectPositionId,
    });

    return res.status(201).json({
      message: 'Volunteer application submitted successfully',
      ...result,
    });
  } catch (error: any) {
    switch (error.message) {
      case 'PROJECT_NOT_FOUND':
        return res.status(404).json({ error: 'Project not found' });
      case 'PROJECT_POSITION_NOT_FOUND':
        return res.status(404).json({ error: 'Project position not found' });
      case 'VOLUNTEER_NOT_FOUND':
        return res.status(400).json({ error: 'Volunteer profile does not exist' });
      case 'VOLUNTEER_FORM_NOT_FOUND':
        return res.status(500).json({ error: 'Volunteer application form not configured' });
      default:
        console.error(error);
        return res.status(500).json({
          error: 'Internal server error',
          details: error.message,
        });
    }
  }
};


export const getVolunteerApplications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const result = await getVolunteerApplicationsModel(userId);

    return res.status(200).json(result);

  } catch (error: any) {
    if (error.message === 'VOLUNTEER_NOT_FOUND') {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    console.error(error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};

export const getAvailableVolunteerActivities = async (
  req: Request,
  res: Response
) => {
  try {
    const { page = '1', limit = '10', search } = req.query; 

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    const result = await getAvailableVolunteerActivitiesModel({
      page: pageNumber,
      limit: pageSize,
      search: search as string | undefined,
    });

    return res.status(200).json(result);

  } catch (error: any) {
    if (error.message === 'INVALID_PAGINATION') {
      return res.status(400).json({ error: 'Invalid pagination values' });
    }

    console.error(error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};
