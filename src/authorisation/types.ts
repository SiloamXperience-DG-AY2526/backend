import { Request } from 'express';

export type Role =
  | 'superAdmin'
  | 'generalManager'
  | 'financeManager'
  | 'partner';

export type PermissionContext = {
  userId: string;
  role: Role;
  req: Request;
};

export type PermissionHandler = (
  context: PermissionContext
) => Promise<boolean> | boolean;
