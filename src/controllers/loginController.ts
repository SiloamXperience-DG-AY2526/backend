import { Request, Response } from 'express';
import { login } from '../services/authService';

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  const token = await login(email, password);

  res.json({ token });
}

