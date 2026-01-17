import { Prisma } from '@prisma/client';
 
export const DonorPublicSummarySelect = {
  user: {
    select: {
      id: true,
      title: true,
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.PartnerSelect;

export const DonorPrivateSummarySelect = {
  id: true,
  user: {
    select: {
      ...DonorPublicSummarySelect.user.select,
      email: true,
      managedDonationProjects: {
        select: {
          id: true,
          title: true,
        }
      }
    },
    
  },
  gender: true,
  contactNumber: true,
  nationality: true,
  identificationNumber: true,  
  dob: true,
  occupation: true,
  otherContactModes: true,
  contactModes: {
    select: {
      mode: true,
    }
  },
} satisfies Prisma.PartnerSelect;