import {
  hasRolePermission,
  createCheckPermission,
  isValidRole,
} from '../../authorisation/checkPermission';
import { PermissionsMap } from '../../authorisation/permissions';
import { VALID_ROLES } from '../../authorisation/permissions/config';
import {
  TEST_PERMISSIONS,
  mockUserId,
} from '../authorisation/permissions/config.helper';

describe('hasRolePermission', () => {
  it('should return true for direct permissions', () => {
    expect(
      hasRolePermission('superAdmin', TEST_PERMISSIONS.mockSuperAdminPermission)
    ).toBe(true);
  });

  it('should return true for inherited permissions', () => {
    expect(
      hasRolePermission(
        'superAdmin',
        TEST_PERMISSIONS.mockSuperAdminInheritedPermission
      )
    ).toBe(true);
  });

  it('should return false for roles without that permission', () => {
    expect(
      hasRolePermission('partner', TEST_PERMISSIONS.mockPartnerAbsentPermission)
    ).toBe(false);
  });

  it('should return false for invalid roles', () => {
    expect(
      hasRolePermission(
        'invalidRole',
        TEST_PERMISSIONS.mockSuperAdminPermission
      )
    ).toBe(false);
  });
});

describe('isValidRole', () => {
  it('should return true for valid roles', () => {
    VALID_ROLES.forEach((role) => {
      expect(isValidRole(role)).toBe(true);
    });
  });

  it('should return false for invalid roles', () => {
    expect(isValidRole('invalidRole')).toBe(false);
    expect(isValidRole('')).toBe(false);
    expect(isValidRole(null as any)).toBe(false);
  });
});

describe('createCheckPermission', () => {
  const mockRequest = {} as any;
  const mockPermissionsMap: PermissionsMap = {
    [TEST_PERMISSIONS.mockSuperAdminPermission]: async () => true,
    [TEST_PERMISSIONS.mockPartnerPermission]: async () => true,
  };

  const checkPermission = createCheckPermission(mockPermissionsMap);

  it('should return true if user role has the required permission', async () => {
    const result = await checkPermission(
      mockUserId,
      'superAdmin',
      TEST_PERMISSIONS.mockPartnerPermission,
      mockRequest
    );
    expect(result).toBe(true);
  });

  it('should return false if user role does not have the required permission', async () => {
    const result = await checkPermission(
      mockUserId,
      'partner',
      TEST_PERMISSIONS.mockPartnerAbsentPermission,
      mockRequest
    );
    expect(result).toBe(false);
  });

  it('should return false for invalid role', async () => {
    const result = await checkPermission(
      mockUserId,
      'invalidRole',
      TEST_PERMISSIONS.mockSuperAdminPermission,
      mockRequest
    );
    expect(result).toBe(false);
  });
});
