import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ProjectStatus } from '@prisma/client';

interface CreateProjectBody {
  title: string;
  description: string;
  targetFund?: number | string;
  timePeriod?: string;
  isRecurring?: boolean;
  frequency?: string;
  startDate: string;
  nextDate?: string;
  status?: ProjectStatus;
  hasVolunteering?: boolean;
  hasDonations?: boolean;
}

interface UpdateProjectBody {
  title?: string;
  description?: string;
  targetFund?: number | string;
  timePeriod?: string;
  isRecurring?: boolean;
  frequency?: string;
  startDate?: string;
  nextDate?: string;
  status?: ProjectStatus;
  hasVolunteering?: boolean;
  hasDonations?: boolean;
}

// GET /projects - Get all projects with optional filtering
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, hasVolunteering, hasDonations } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as ProjectStatus;
    }

    if (hasVolunteering !== undefined) {
      where.hasVolunteering = hasVolunteering === 'true';
    }

    if (hasDonations !== undefined) {
      where.hasDonations = hasDonations === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch projects',
      ...(process.env.NODE_ENV === 'development' && { error: (error as Error).message }),
    });
  }
};

// GET /projects/:id - Get a single project by ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        sessions: true,
        volunteerProjects: {
          include: {
            volunteer: true,
          },
        },
        disbursements: true,
        feedbacks: true,
        RecurringDonation: true,
        DonationTransaction: true,
      },
    });

    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch project',
      ...(process.env.NODE_ENV === 'development' && { error: (error as Error).message }),
    });
  }
};

// POST /projects - Create a new project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if request body exists
    if (!req.body) {
      res.status(400).json({
        status: 'error',
        message: 'Request body is required',
      });
      return;
    }

    const body: CreateProjectBody = req.body;

    // Validate required fields
    if (!body.title || !body.description || !body.startDate) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields: title, description, and startDate are required',
      });
      return;
    }

    const projectData: any = {
      title: body.title,
      description: body.description,
      timePeriod: body.timePeriod,
      isRecurring: body.isRecurring ?? false,
      frequency: body.frequency,
      startDate: new Date(body.startDate),
      nextDate: body.nextDate ? new Date(body.nextDate) : null,
      status: body.status ?? ProjectStatus.DRAFT,
      hasVolunteering: body.hasVolunteering ?? false,
      hasDonations: body.hasDonations ?? false,
    };

    if (body.targetFund !== undefined) {
      projectData.targetFund = typeof body.targetFund === 'string'
        ? parseFloat(body.targetFund)
        : body.targetFund;
    }

    const project = await prisma.project.create({
      data: projectData,
    });

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    console.error('Request body:', req.body);
    console.error('Request headers:', req.headers);

    res.status(500).json({
      status: 'error',
      message: 'Failed to create project',
      ...(process.env.NODE_ENV === 'development' && { 
        error: (error as Error).message,
        stack: (error as Error).stack 
      }),
    });
  }
};

// PATCH /projects/:id - Update a project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body: UpdateProjectBody = req.body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
      return;
    }

    // Build update data object
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.targetFund !== undefined) {
      updateData.targetFund = typeof body.targetFund === 'string'
        ? parseFloat(body.targetFund)
        : body.targetFund;
    }
    if (body.timePeriod !== undefined) updateData.timePeriod = body.timePeriod;
    if (body.isRecurring !== undefined) updateData.isRecurring = body.isRecurring;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.nextDate !== undefined) updateData.nextDate = body.nextDate ? new Date(body.nextDate) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.hasVolunteering !== undefined) updateData.hasVolunteering = body.hasVolunteering;
    if (body.hasDonations !== undefined) updateData.hasDonations = body.hasDonations;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: 'success',
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update project',
      ...(process.env.NODE_ENV === 'development' && { error: (error as Error).message }),
    });
  }
};

// DELETE /projects/:id - Delete a project
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    
    // P2003 is for foreign key constraint errors
    // Client needs to delete the associated records first
    // If we want to enable cascade delete later on,
    // ChatGPT says we can simply update the schema to use onDelete: Cascade
    if ((error as any).code === 'P2003') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot delete project: it has associated records (sessions, volunteers, donations, etc.)',
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete project',
      ...(process.env.NODE_ENV === 'development' && { error: (error as Error).message }),
    });
  }
};

