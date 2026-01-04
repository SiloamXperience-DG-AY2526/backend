import { Request, Response } from 'express';
import * as generalService from '../services/general.service';

export const getVolProjects = async (req : Request, res : Response) => {
    const projSummaries = await generalService.getVolProjects();
    res.json(projSummaries);
}