import { UserRole } from '@prisma/client';
// import { getStaffProfile, updateStaffProfile } from '../models/general.model';
import { findUserByIdWithRoles, getPartnerProfile, updatePartnerProfile, getComprehensivePartnerInfo } from '../models/partner.model';
import { StaffProfile, PartnerProfile, PartnerProfileSchema } from '../schemas/user';
import { NotFoundError, ValidationError } from '../utils/errors';

export const getUserProfileService = async (userId: string) => {
  
  const user = await findUserByIdWithRoles(userId);

  if (!user) {
    throw new NotFoundError(`User ${userId} not found!`);
  }

  if (user.role == UserRole.partner) {
    const partnerData = await getPartnerProfile(userId);

    return partnerData;

  } else {
    // const staffData = await getStaffProfile(userId);

    // return staffData;
    return;

  }
};

export const updateUserProfileService = async (
  userId: string, 
  newUserProfile: StaffProfile | PartnerProfile
) => {
  const user = await findUserByIdWithRoles(userId);
  
  if (!user) {
    throw new NotFoundError(`User ${userId} not found!`);
  }

  if (user.role == UserRole.partner) {
    try {
      const newPartnerProfile = PartnerProfileSchema.parse(newUserProfile);
  
      return await updatePartnerProfile(userId, newPartnerProfile);

    } catch (err) {

      throw new ValidationError('Error updating partner profile', err);

    }    
  } else { // staff
    // try {
    //   const newStaffProfile = StaffProfileSchema.parse(newUserProfile);

    //   return await updateStaffProfile(userId, newStaffProfile);

    // } catch (err) {
      
    //   throw new ValidationError('Error updating staff profile', err);
    // }

    return;
    
  }
};

export const getComprehensivePartnerInfoService = async (userId: string) => {
  const user = await findUserByIdWithRoles(userId);
  
  if (!user) {
    throw new NotFoundError(`User ${userId} not found!`);
  }

  if (user.role !== UserRole.partner) {
    throw new NotFoundError('User is not a partner');
  }

  return await getComprehensivePartnerInfo(userId);
};