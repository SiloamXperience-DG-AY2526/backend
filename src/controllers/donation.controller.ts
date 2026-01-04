import { Request, Response } from 'express';
import * as donationService from '../services/donation.service';
import { getUserIdFromRequest } from '../utils/user';
import {
  getDonationProjectsSchema,
  getDonationHistorySchema,
  submitDonationApplicationSchema,
  donationIdSchema,
} from '../schemas/index';

export const getDonationProjects = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const projects = await donationService.getDonationProjects(managerId);
  res.json(projects);
};

export const getDonationProjectDetails = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const project = await donationService.getDonationProjectDetails(
    projectId,
    managerId
  );
  res.json(project);
};

export const createDonationProject = async (req: Request, res: Response) => {
  const managerId = getUserIdFromRequest(req);
  const project = await donationService.createDonationProject(
    managerId,
    req.body
  );
  res.status(201).json(project);
};

export const updateDonationProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const managerId = getUserIdFromRequest(req);
  const updatedProject = await donationService.updateDonationProject(
    projectId,
    managerId,
    req.body
  );
  res.json(updatedProject);
};


/**
 * Controller: Get donation homepage data
 * GET /donations/home
 */
export const getDonationHomepage = async (req: Request, res: Response) => {
  const homepageData = await donationService.getDonationHomepageData();
  res.json(homepageData);
};

/**
 * Controller: Get all donation projects
 * GET /donations/projects?type=ongoing|specific|all&page=1&limit=20
 */
export const getAllDonationProjects = async (req: Request, res: Response) => {
  const filters = getDonationProjectsSchema.parse({
    type: req.query.type,
    page: req.query.page,
    limit: req.query.limit,
  });

  const result = await donationService.getAllDonationProjects(filters);
  res.json(result);
};

/**
 * Controller: Submit donation application
 * POST /donations/applications
 * Body: { projectId, type, countryOfResidence, paymentMode, amount, brickCount? }
 */
export const submitDonationApplication = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user (req.user.id)
  // For now, this should be implemented once auth middleware is in place
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const validatedData = submitDonationApplicationSchema.parse(req.body);
  const donation = await donationService.submitDonationApplication(
    partnerId,
    validatedData
  );

  res.status(201).json({
    message: 'Donation application submitted successfully',
    donation,
  });
};

/**
 * Controller: Get partner's donation history
 * GET /donations/partners/donations?status=pending|completed|cancelled|all&page=1&limit=10
 */
export const getPartnerDonationHistory = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const filters = getDonationHistorySchema.parse({
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  const result = await donationService.getPartnerDonationHistory(partnerId, filters);
  res.json(result);
};

/**
 * Controller: Get donation detail
 * GET /donations/:donationId
 */
export const getDonationDetail = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const { donationId } = donationIdSchema.parse({ donationId: req.params.donationId });
  const donation = await donationService.getDonationDetail(donationId, partnerId);

  res.json(donation);
};

/**
 * Controller: Download donation receipt
 * GET /donations/:donationId/receipt
 * TODO: Implement receipt generation (PDF or similar)
 */
export const downloadDonationReceipt = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const { donationId } = donationIdSchema.parse({ donationId: req.params.donationId });
  const donation = await donationService.getDonationDetail(donationId, partnerId);

  // Check if receipt is available (donation must be received/completed)
  if (donation.receiptStatus !== 'received') {
    res.status(400).json({
      error: 'Receipt not available. Donation must be confirmed by finance manager first.',
    });
    return;
  }

  // TODO: Generate and return PDF receipt
  // For now, return the receipt URL if it exists
  if (donation.receipt) {
    res.json({
      receiptUrl: donation.receipt,
      message: 'Receipt available',
    });
    return;
  }

  res.status(404).json({ error: 'Receipt not yet generated' });
};
