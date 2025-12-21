import { Router } from 'express';
import * as controller from '../controllers/finance.controller';
import { validateRequest } from '../middlewares/validateRequest';
import * as schema from '../schemas';

const router = Router();

router.use(
  '/projects/:projectId',
  validateRequest({ params: schema.projectIdSchema })
);

router.get('/budgets', controller.getFinancialOverview);
router.get('/projects/:projectId/budgets', controller.getProjectBudgets);
router.get(
  '/projects/:projectId/transactions',
  controller.getProjectTransactions
);

router.post(
  '/projects/:projectId/commitment',
  validateRequest({ body: schema.CreateCommitmentSchema }),
  controller.createCommitment
);
router.patch(
  '/projects/:projectId/commitment/:id',
  validateRequest({
    params: schema.idSchema,
    body: schema.CommitmentStatusSchema,
  }),
  controller.updateCommitmentStatus
);
router.delete(
  '/projects/:projectId/commitment/:id',
  validateRequest({ params: schema.idSchema }),
  controller.deleteCommitment
);

router.post(
  '/projects/:projectId/disbursement',
  validateRequest({ body: schema.CreateDisbursementSchema }),
  controller.createDisbursement
);
router.patch(
  '/projects/:projectId/disbursement/:id',
  validateRequest({
    params: schema.idSchema,
    body: schema.DisbursementStatusSchema,
  }),
  controller.updateDisbursementStatus
);
router.delete(
  '/projects/:projectId/disbursement/:id',
  validateRequest({ params: schema.idSchema }),
  controller.deleteDisbursement
);

export default router;
