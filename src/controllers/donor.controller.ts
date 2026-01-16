import { Request, Response } from 'express';
import * as donorService from '../services/donor.service';
import { getUserPayloadFromRequest } from '../utils/user';
import { DonorDetailQuerySchema, DonorQuerySchema } from '../schemas';

/**
 * Controller: Get all donation projects
 */
export const getDonors = async (req: Request, res: Response) => {
  const userPayload = getUserPayloadFromRequest(req);
  const filters = DonorQuerySchema.parse({
    page: req.query.page,
    limit: req.query.limit,
  });

  const donors = await donorService.getDonors(userPayload, filters);
  res.status(200).json(donors);
};


/**
 * Controller: Get donor details
 */
export const getDonorDetails = async (req: Request, res: Response) => {
  const userPayload = getUserPayloadFromRequest(req);
  const {donorId} = req.params;
  const donationFilters = DonorDetailQuerySchema.parse({
    donorId,
    page: req.query.page,
    limit: req.query.limit,
  });

  const donorDetails = await donorService.getDonorDetails(userPayload, donationFilters);
  res.status(200).json(donorDetails);
};
