import { Request, Response, NextFunction } from 'express';
import { partnerSignupSchema } from '../schemas/auth';
import { signupPartnerWithOnboarding } from '../services/auth.service';
import { login } from '../services/auth.service';

export async function signupPartner(req: Request, res: Response, next: NextFunction) {
  try {
    const data = partnerSignupSchema.parse(req.body);

    const token = await signupPartnerWithOnboarding(
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.partner
    );

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const token = await login(email, password);

    res.json({ token });
  } catch (err) {
    next(err);
  }
}
