import { Request, Response, NextFunction } from 'express';
import * as service from '../services/emailCampaign.service';
import {
  createEmailCampaignSchema,
  updateAudienceSchema,
  updateDeliverySchema,
  updateContentSchema,
  sendTestEmailSchema,
  EmailCampaignIdSchema,
  EmailCampaignListQuerySchema,
} from '../schemas/emailCampaign';

export async function createCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createEmailCampaignSchema.parse(req.body);

    const campaign = await service.createCampaign(
      req.user!.userId,
      data
    );

    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
}

export async function updateAudience(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);
    const data = updateAudienceSchema.parse(req.body);

    await service.updateAudience(campaignId, data);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function updateContent(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);
    const data = updateContentSchema.parse(req.body);

    await service.updateContent(campaignId, data);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function updateDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);
    const data = updateDeliverySchema.parse(req.body);

    await service.updateDelivery(campaignId, data.scheduledAt);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function previewAudience(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);

    const result = await service.previewAudience(campaignId);
    res.json({ audienceCount: result.count, emails: result.emails });
  } catch (err) {
    next(err);
  }
}

export async function sendTestEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);
    const data = sendTestEmailSchema.parse(req.body);

    await service.sendTestEmail(campaignId, data.email);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function publishCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);

    await service.publishCampaign(campaignId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function getScheduledCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const campaigns = await service.getScheduledCampaigns();
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

export async function getCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = EmailCampaignListQuerySchema.parse(req.query);
    const result = await service.getCampaigns(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCampaignDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);
    const campaign = await service.getCampaignDetails(campaignId);
    if (!campaign) {
      res.sendStatus(404);
      return;
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = EmailCampaignIdSchema.parse(req.params);

    await service.deleteCampaign(campaignId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
