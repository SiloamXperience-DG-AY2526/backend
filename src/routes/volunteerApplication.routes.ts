import { Router } from 'express';
import * as controller from '../controllers/volunteerProject.controller';
const router = Router();

//GET your own applications to any project
//Filter by user, status
//No need Permission check: all users can view his own applications
router.get(
  '/me',
  controller.getVolunteerApplications
);

export default router;
