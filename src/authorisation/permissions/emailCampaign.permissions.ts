import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';

export const emailCampaignPermissions = {
  'emailCampaign:create': nothingElse,
  'emailCampaign:update': nothingElse,
  'emailCampaign:read': nothingElse,
  'emailCampaign:test': nothingElse,
  'emailCampaign:publish': nothingElse,
  'emailCampaign:delete': nothingElse,

  'emailCampaign:send': nothingElse,
  'emailCampaign:template': nothingElse,

} satisfies Record<string, PermissionHandler>;
