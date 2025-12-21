import { Request, Response } from "express";
import { partnerSignupSchema } from "../middlewares/authMiddleware";
import { signupPartnerWithOnboarding } from "../services/authService";

export async function partnerSignup(req: Request, res: Response) {
  try {
    const data = partnerSignupSchema.parse(req.body);

    const token = await signupPartnerWithOnboarding(
      data.name,
      data.email,
      data.password,
      data.formId,
      data.responses
    );

    res.status(201).json({ token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
