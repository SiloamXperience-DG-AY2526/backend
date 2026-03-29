import { Request, Response, NextFunction } from 'express';
import { createStaffSchema, staffIdSchema } from '../schemas/staff';
import {
  createStaffAccount,
  deactivateStaffAccount,
  activateStaffAccount,
  getAllStaffAccount,
} from '../services/staff.service';
import { Role } from '../authorisation/permissions/config';

export async function createStaff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createStaffSchema.parse(req.body);
    const callerRole = req.user!.role as Role;

    const token = await createStaffAccount(
      data.firstName,
      data.lastName,
      data.title,
      data.email,
      data.password,
      data.role,
      callerRole,
    );

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
}

export async function deactivateStaff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = staffIdSchema.parse(req.params);
    const callerRole = req.user!.role as Role;

    await deactivateStaffAccount(data.staffId, callerRole);

    res.status(200).json({
      message: 'Staff account deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function activateStaff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = staffIdSchema.parse(req.params);
    const callerRole = req.user!.role as Role;

    await activateStaffAccount(data.staffId, callerRole);

    res.status(200).json({
      message: 'Staff account activated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllStaff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const callerRole = req.user!.role as Role;
    const staff = await getAllStaffAccount(callerRole);

    res.status(200).json({
      data: staff,
    });
  } catch (err) {
    next(err);
  }
}
