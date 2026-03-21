import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as staffService from '../../services/staff.service';
import * as staffModel from '../../models/staff.model';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';
import { ForbiddenError } from '../../utils/errors';

jest.mock('../../models/staff.model');
jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

const mockedStaffModel = staffModel as jest.Mocked<typeof staffModel>;
const mockedPasswordUtils = passwordUtils as jest.Mocked<typeof passwordUtils>;
const mockedJwtUtils = jwtUtils as jest.Mocked<typeof jwtUtils>;

describe('staffService.createStaffAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forbids subAdmin from creating a superAdmin account', async () => {
    await expect(
      staffService.createStaffAccount(
        'Jane',
        'Doe',
        'Ms',
        'jane@example.com',
        'Password123',
        UserRole.superAdmin,
        UserRole.subAdmin,
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mockedPasswordUtils.hashPassword).not.toHaveBeenCalled();
    expect(mockedStaffModel.createStaffUser).not.toHaveBeenCalled();
    expect(mockedJwtUtils.signToken).not.toHaveBeenCalled();
  });

  it('forbids subAdmin from creating another subAdmin account', async () => {
    await expect(
      staffService.createStaffAccount(
        'John',
        'Doe',
        'Mr',
        'john@example.com',
        'Password123',
        UserRole.subAdmin,
        UserRole.subAdmin,
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mockedPasswordUtils.hashPassword).not.toHaveBeenCalled();
    expect(mockedStaffModel.createStaffUser).not.toHaveBeenCalled();
    expect(mockedJwtUtils.signToken).not.toHaveBeenCalled();
  });

  it('allows superAdmin to create a subAdmin account', async () => {
    mockedPasswordUtils.hashPassword.mockResolvedValue('hashed-password');
    mockedStaffModel.createStaffUser.mockResolvedValue({
      id: 'staff-1',
      role: UserRole.subAdmin,
    } as any);
    mockedJwtUtils.signToken.mockReturnValue('token-123');

    const result = await staffService.createStaffAccount(
      'Mary',
      'Smith',
      'Ms',
      'mary@example.com',
      'Password123',
      UserRole.subAdmin,
      UserRole.superAdmin,
    );

    expect(mockedPasswordUtils.hashPassword).toHaveBeenCalledWith(
      'Password123',
    );
    expect(mockedStaffModel.createStaffUser).toHaveBeenCalledWith(
      'Mary',
      'Smith',
      'Ms',
      'mary@example.com',
      'hashed-password',
      UserRole.subAdmin,
    );
    expect(mockedJwtUtils.signToken).toHaveBeenCalledWith({
      userId: 'staff-1',
      role: UserRole.subAdmin,
      hasOnboarded: true,
    });
    expect(result).toBe('token-123');
  });
});
