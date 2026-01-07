import { Request, Response } from 'express';
import * as generalService from '../services/general.service';
import { getUserIdFromRequest } from '../utils/user';
import { ProjectApprovalStatus } from '@prisma/client';

export const getVolProjects = async (req: Request, res: Response) => {
    try {
        const projSummaries = await generalService.getVolProjects();
        res.json(projSummaries);
    } catch {
        res.status(500).json({ error: 'Failed to fetch volunteer projects' });
    }
};

export const updateVolProjectStatus = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { status } = req.body;
    const managerId = getUserIdFromRequest(req);

    if (!Object.values(ProjectApprovalStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const updatedProject = await generalService.updateVolProjectStatus(
            projectId,
            managerId,
            status as ProjectApprovalStatus
        );
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project status' });
    }
}