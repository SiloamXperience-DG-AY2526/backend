import { Request, Response, NextFunction } from 'express';
import { createStaffSchema } from '../schemas/staff';
import { createStaffAccount } from '../services/staff.service';

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
