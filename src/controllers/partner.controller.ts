import { Request, Response } from 'express';
import * as partnerService from '../services/partner.service';
import { PartnerQueryType } from '../schemas/user';

export const getPartners = async (req: Request, res: Response) => {
  const filters = req.query as unknown as PartnerQueryType;
  const result = await partnerService.getPartners(filters);
  res.json(result);
};
