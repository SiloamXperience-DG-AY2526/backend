import { Router } from 'express';
import * as controller from '../controllers/finance.controller';
import { validateRequest } from '../middlewares/validateRequest';
import * as schema from '../schemas';

const router = Router();

router.use(
  '/projects/:projectId',
  validateRequest({ params: schema.ProjectIdSchema })
);

router.get('/budgets', controller.getFinancialOverview);
router.get('/projects/:projectId/budgets', controller.getProjectBudgets);
router.get(
  '/projects/:projectId/transactions',
  controller.getProjectTransactions
);

router.post(
  '/projects/:projectId/commitments',
  validateRequest({ body: schema.CreateCommitmentSchema }),
  controller.createCommitment
);
router.patch(
  '/projects/:projectId/commitments/:id',
  validateRequest({
    params: schema.IdSchema,
    body: schema.CommitmentStatusSchema,
  }),
  controller.updateCommitmentStatus
);
router.delete(
  '/projects/:projectId/commitments/:id',
  validateRequest({ params: schema.IdSchema }),
  controller.deleteCommitment
);

router.post(
  '/projects/:projectId/disbursements',
  validateRequest({ body: schema.CreateDisbursementSchema }),
  controller.createDisbursement
);
router.patch(
  '/projects/:projectId/disbursements/:id',
  validateRequest({
    params: schema.IdSchema,
    body: schema.DisbursementStatusSchema,
  }),
  controller.updateDisbursementStatus
);
router.delete(
  '/projects/:projectId/disbursements/:id',
  validateRequest({ params: schema.IdSchema }),
  controller.deleteDisbursement
);

export default router;
