import { Request, Response } from 'express';
import { getUserProfileService, updateUserProfileService } from '../services/profile.service';
import { getUserIdFromRequest } from '../utils/user';

export const getUserProfile = async (req: Request, res: Response) => {
  
  const userId = getUserIdFromRequest(req);
  
  const profile = await getUserProfileService(userId);
  
  return res.status(200).json(profile);
};

export const updateUserProfile = async (req: Request, res: Response) => {
  
  const userId = getUserIdFromRequest(req);

  const newUserProfile = req.body;

  const newProfile = await updateUserProfileService(userId, newUserProfile);

  return res.status(201).json({
    message: 'Updated profile successfully!',
    updatedProfile: {
      ...newProfile
    },
  });
};