import { Request, Response, NextFunction } from 'express';
import { partnerSignupSchema } from '../schemas/auth';
import { signupPartnerWithOnboarding, login, requestPasswordResetService, resetPasswordService } from '../services/auth.service';

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

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    await requestPasswordResetService(email);

    return res.status(200).json({
      status: 'success',
      message: 'Password reset request sent.',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, token, newPassword } = req.body;

    await resetPasswordService(userId, token, newPassword);

    res.status(201).json({ 
      status: 'success',
      message: 'Password has been reset successfully' 
    });
  } catch (err) {
    next(err);
  }
}
