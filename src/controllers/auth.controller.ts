import { Request, Response } from 'express';
import { partnerSignupSchema } from '../middlewares/authMiddleware';
import { signupPartnerWithOnboarding } from '../services/auth.service';
import { login } from '../services/auth.service';

export async function signupPartner(req: Request, res: Response) {
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  const token = await login(email, password);

  res.json({ token });
}
