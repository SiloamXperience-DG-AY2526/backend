import { Request, Response } from 'express';
import * as partnerService from '../services/partner.service';
import { PartnerQueryType } from '../schemas/user';

export const getPartners = async (req: Request, res: Response) => {
  const filters = req.query as unknown as PartnerQueryType;
  const result = await partnerService.getPartners(filters);
  res.json(result);
};

export const deactivatePartner = async (req: Request, res: Response) => {
  const { partnerId } = req.params;
  await partnerService.deactivatePartner(partnerId);

  return res.status(200).json({
    message: 'Volunteer account deactivated successfully',
  });
};
