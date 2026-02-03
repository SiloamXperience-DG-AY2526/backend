import { Router } from 'express';
import * as controller from '../controllers/partner.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import { PartnerQuerySchema } from '../schemas/user';

const router = Router();

router.get(
  '/',
  requirePermission('partners:view'),
  validateRequest({ query: PartnerQuerySchema }),
  controller.getPartners
);

export default router;
