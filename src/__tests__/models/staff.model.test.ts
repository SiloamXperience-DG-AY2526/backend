import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  activateStaff,
  deactivateStaff,
  getAllStaff,
} from '../../models/staff.model';
import { ForbiddenError } from '../../utils/errors';

const mockFindUnique = jest.fn<(...args: any[]) => Promise<any>>();
const mockFindMany = jest.fn<(...args: any[]) => Promise<any>>();
const mockUpdate = jest.fn<(...args: any[]) => Promise<any>>();
const mockMapStaffToResponse = jest.fn((user: any) => ({
  id: user.id,
}));

jest.mock('../../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

jest.mock('../../schemas/staff', () => ({
  mapStaffToResponse: (user: unknown) => mockMapStaffToResponse(user),
}));

describe('staff.model role restrictions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStaff', () => {
    it('filters out subAdmin/superAdmin when caller is subAdmin', async () => {
      mockFindMany.mockResolvedValue([{ id: 'gm-1' }, { id: 'fm-1' }]);

      await getAllStaff(UserRole.subAdmin);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            role: {
              in: [UserRole.generalManager, UserRole.financeManager],
            },
          },
        }),
      );
    });

    it('includes subAdmin (but not superAdmin) when caller is superAdmin', async () => {
      mockFindMany.mockResolvedValue([{ id: 'sa-1' }]);

      await getAllStaff(UserRole.superAdmin);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            role: {
              in: [
                UserRole.subAdmin,
                UserRole.generalManager,
                UserRole.financeManager,
              ],
            },
          },
        }),
      );
    });
  });

  describe('deactivateStaff', () => {
    it.each([UserRole.superAdmin, UserRole.subAdmin])(
      'forbids subAdmin from deactivating %s accounts',
      async (targetRole: UserRole) => {
        mockFindUnique.mockResolvedValue({ id: 'target-1', role: targetRole });

        await expect(
          deactivateStaff('target-1', UserRole.subAdmin),
        ).rejects.toThrow(ForbiddenError);
        expect(mockUpdate).not.toHaveBeenCalled();
      },
    );

    it('allows superAdmin to deactivate a subAdmin account', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'target-1',
        role: UserRole.subAdmin,
      });
      mockUpdate.mockResolvedValue({ id: 'target-1', isActive: false });

      const result = await deactivateStaff('target-1', UserRole.superAdmin);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-1' },
        data: { isActive: false },
      });
      expect(result).toEqual({ id: 'target-1', isActive: false });
    });
  });

  describe('activateStaff', () => {
    it.each([UserRole.superAdmin, UserRole.subAdmin])(
      'forbids subAdmin from activating %s accounts',
      async (targetRole: UserRole) => {
        mockFindUnique.mockResolvedValue({ id: 'target-1', role: targetRole });

        await expect(
          activateStaff('target-1', UserRole.subAdmin),
        ).rejects.toThrow(ForbiddenError);
        expect(mockUpdate).not.toHaveBeenCalled();
      },
    );

    it('allows superAdmin to activate a subAdmin account', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'target-1',
        role: UserRole.subAdmin,
      });
      mockUpdate.mockResolvedValue({ id: 'target-1', isActive: true });

      const result = await activateStaff('target-1', UserRole.superAdmin);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-1' },
        data: { isActive: true },
      });
      expect(result).toEqual({ id: 'target-1', isActive: true });
    });
  });
});
