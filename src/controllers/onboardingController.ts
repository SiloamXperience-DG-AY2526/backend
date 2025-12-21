import { Request, Response } from 'express';
import { getPartnerOnboarding } from '../services/onboardingService';

export async function getMyPartnerOnboarding(req: Request, res: Response) {
  const { userId } = req.body;
  const submissions = await getPartnerOnboarding(userId);
  res.json(submissions);
}
