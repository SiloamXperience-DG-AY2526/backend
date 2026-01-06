import { PermissionsMap } from '../../../authorisation/permissions';

const mockSuperAdminPermission = 'example:view' as const;
const mockPartnerPermission = 'example:update:own' as const;

const mockSuperAdminInheritedPermission = mockPartnerPermission;
const mockPartnerAbsentPermission = mockSuperAdminPermission;

export const mockUserId = 'mock-user-uuid';
export const TEST_PERMISSIONS = {
  mockSuperAdminPermission,
  mockPartnerPermission,
  mockSuperAdminInheritedPermission,
  mockPartnerAbsentPermission,
} as const;

export const mockPermissionsMap: PermissionsMap = {
  [TEST_PERMISSIONS.mockPartnerPermission]: async () => true,
  [TEST_PERMISSIONS.mockPartnerAbsentPermission]: async () => true,
};
