import { Request, Response, NextFunction } from 'express';
import { createStaffSchema, staffIdSchema } from '../schemas/staff';
import { createStaffAccount, deactivateStaffAccount, activateStaffAccount, getAllStaffAccount } from '../services/staff.service';

export async function createStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createStaffSchema.parse(req.body);

    const token = await createStaffAccount(
      data.firstName,
      data.lastName,
      data.title,
      data.email,
      data.password,
      data.role
    );

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
}

export async function deactivateStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const data = staffIdSchema.parse(req.params);

    await deactivateStaffAccount(data.staffId);

    res.status(200).json({
      message: 'Staff account deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function activateStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const data = staffIdSchema.parse(req.params);

    await activateStaffAccount(data.staffId);

    res.status(200).json({
      message: 'Staff account activated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await getAllStaffAccount();

    res.status(200).json({
      data: staff,
    });
  } catch (err) {
    next(err);
  }
}