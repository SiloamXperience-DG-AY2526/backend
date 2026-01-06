import { Request, Response } from 'express';
import * as generalService from '../services/general.service';

export const getVolProjects = async (req: Request, res: Response) => {
  try {
    const projSummaries = await generalService.getVolProjects();
    res.json(projSummaries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteer projects' });
  }
};