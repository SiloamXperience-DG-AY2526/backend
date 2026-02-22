import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import * as controller from '../controllers/emailCampaign.controller';
import {
  createEmailCampaignSchema,
  updateAudienceSchema,
  updateDeliverySchema,
  updateContentSchema,
  sendTestEmailSchema,
  EmailCampaignIdSchema,
  EmailCampaignListQuerySchema,
  SaveTemplateSchema,
  ProcessReceiptSchema,
  GetTemplateQuerySchema,
} from '../schemas/emailCampaign';
import { DonationProjectIdSchema, DonationTransactionIdSchema } from '../schemas';

const router = Router();

//email for financial manager review, should I separate folder
router.put(
  '/templates/:projectId',

  validateRequest({ params: DonationProjectIdSchema, body: SaveTemplateSchema }),
  controller.donationReviewEmailSaveTemplate
);

router.get(
  '/templates/:projectId',
  validateRequest({ params: DonationProjectIdSchema, query: GetTemplateQuerySchema }),
  controller.donationReviewEmailGetTemplate
);

router.post(
  '/transactions/:transactionId/thank-you',
 
  validateRequest({ params: DonationTransactionIdSchema }),
  controller.donationReviewEmailSendThankYou
);

router.post(
  '/transactions/:transactionId/follow-up',

  validateRequest({ params: DonationTransactionIdSchema }),
  controller.donationReviewEmailFollowUp
);

router.post(
  '/transactions/:transactionId/process-receipt',

  validateRequest({ params: DonationTransactionIdSchema, body: ProcessReceiptSchema }),
  controller.donationReviewEmailProcessReceipt
);

// Create draft campaign
router.post(
  '/',
  requirePermission('emailCampaign:create'),
  validateRequest({ body: createEmailCampaignSchema }),
  controller.createCampaign
);

// View all campaigns (including drafts)
router.get(
  '/all',
  requirePermission('emailCampaign:read'),
  validateRequest({ query: EmailCampaignListQuerySchema }),
  controller.getCampaigns
);

// View scheduled campaigns only
router.get(
  '/',
  requirePermission('emailCampaign:read'),
  controller.getScheduledCampaigns
);

router.use(
  '/:campaignId',
  validateRequest({ params: EmailCampaignIdSchema })
);

// Update audience
router.put(
  '/:campaignId/audience',
  requirePermission('emailCampaign:update'),
  validateRequest({ body: updateAudienceSchema }),
  controller.updateAudience
);

// Update delivery
router.put(
  '/:campaignId/delivery',
  requirePermission('emailCampaign:update'),
  validateRequest({ body: updateDeliverySchema }),
  controller.updateDelivery
);

// Update content
router.put(
  '/:campaignId/content',
  requirePermission('emailCampaign:update'),
  validateRequest({ body: updateContentSchema }),
  controller.updateContent
);

// Get campaign details
router.get(
  '/:campaignId',
  requirePermission('emailCampaign:read'),
  controller.getCampaignDetails
);

// Preview audience size
router.get(
  '/:campaignId/preview',
  requirePermission('emailCampaign:read'),
  controller.previewAudience
);

// Send test email
router.post(
  '/:campaignId/test',
  requirePermission('emailCampaign:test'),
  validateRequest({ body: sendTestEmailSchema }),
  controller.sendTestEmail
);

// Publish campaign
router.post(
  '/:campaignId/publish',
  requirePermission('emailCampaign:publish'),
  controller.publishCampaign
);

// View scheduled campaigns only
// Delete campaign
router.delete(
  '/:campaignId',
  requirePermission('emailCampaign:delete'),
  controller.deleteCampaign
);



export default router;