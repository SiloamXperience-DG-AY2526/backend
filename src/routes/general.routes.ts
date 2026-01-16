import { Router } from 'express';
import * as controller from '../controllers/general.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { VolunteerProjectIdSchema } from '../schemas';
import { PartnerFeedbackSchema } from '../schemas/general/partnerProjects.schemas';
const router = Router();

// USE validation middleware for routes with projectId param
router.use(
  ['/volunteerProjects/:projectId'],
  validateRequest({ params: VolunteerProjectIdSchema })
);


// POST submit peer feedback for a volunteer project
// No need permission check: all users can submit peer feedback
router.post('/peer-feedback',
  validateRequest({ body: PartnerFeedbackSchema }),
  controller.submitPeerFeedback
);

// GET all peer feedback for specific volunteer project
router.get('/peer-feedback/volunteerProjects/:projectId',
  controller.getPeerFeedbackForProject
);

// GET all peer feedback for volunteer projects
// No need permission check: all users can view peer feedback
router.get('/peer-feedback/all',
  controller.getAllPeerFeedback
);

export default router;