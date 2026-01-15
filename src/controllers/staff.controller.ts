import { Request, Response, NextFunction } from 'express';
import { createStaffSchema, staffIdSchema } from '../schemas/staff';
import { createStaffAccount, removeStaffAccount } from '../services/staff.service';

export async function createStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createStaffSchema.parse(req.body);

    const token = await createStaffAccount(
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.role
    );

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
}

export async function removeStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const data = staffIdSchema.parse(req.params);

    await removeStaffAccount(data.staffId);

    res.status(200).json({
      message: 'Staff account removed successfully',
    });
  } catch (err) {
    next(err);
  }
}