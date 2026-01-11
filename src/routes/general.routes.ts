import { Router } from 'express';
import * as controller from '../controllers/general.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { VolunteerProjectIdSchema } from '../schemas';
import { PartnerFeedbackSchema } from '../schemas/general/partnerProjects.schemas';

const router = Router();

router.use(
  ['/volunteerProjects/:projectId'],
  validateRequest({ params: VolunteerProjectIdSchema })
);

router.post('/peer-feedback',
  validateRequest({ body: PartnerFeedbackSchema }),
  controller.submitPeerFeedback
);

router.get('/peer-feedback/all',
  controller.getAllPeerFeedback
);

export default router;