import { Request } from 'express';

export type PermissionContext = {
  userId: string;
  role: string;
  req: Request;
};

export type PermissionHandler = (
  context: PermissionContext
) => Promise<boolean> | boolean;
