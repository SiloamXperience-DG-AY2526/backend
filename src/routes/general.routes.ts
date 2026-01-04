import { Router } from "express";
import * as controller from "../controllers/general.controller";

const router = Router();

router.get("/volunteerProjects", controller.getVolProjects);

export default router;