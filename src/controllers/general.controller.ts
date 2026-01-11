import { Request, Response } from 'express';
import * as generalService from '../services/general.service';
import { getUserIdFromRequest } from '../utils/user';

export const getVolProjects = async (req: Request, res: Response) => {
  const projSummaries = await generalService.getVolProjects();
  res.status(200).json({
    status: 'success',
    message: 'Volunteer projects fetched successfully',
    data: projSummaries
  });
};

export const submitPeerFeedback = async (req: Request, res: Response) => {
  const feedbackData = req.body;

  const result = await generalService.submitPeerFeedback(feedbackData);
  res.status(201).json({
    status: 'success',
    message: 'Partner feedback submitted successfully',
    data: result
  });
};

export const getAllPeerFeedback = async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const feedbackList = await generalService.getAllPeerFeedback(userId);
  res.status(200).json({
    status: 'success',
    message: 'Peer feedback fetched successfully',
    data: feedbackList
  });

};