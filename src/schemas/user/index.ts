import { z } from 'zod';
import { preprocessDate } from '../helper';

// enums
const Gender = ['male', 'female', 'others'] as const;
const ContactMode = ['email', 'whatsapp', 'telegram', 'messenger', 'phoneCall'] as const;
const InterestSlug = [
  'fundraise',
  'planTrips',
  'missionTrips',
  'longTerm',
  'admin',
  'publicity',
  'teaching',
  'training',
  'agriculture',
  'building',
  'others',
] as const;
export const ReferrerTypeValues = ['friend', 'socialMedia', 'church', 'website', 'event', 'other'] as const;

// separate out fields based on User/ Partner model
// for easier update of Partner profile
export const UserOnlyProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  title: z.string().min(1).optional(),
  email: z.string(),
  // cannot change role
});

export const PartnerOnlyProfileSchema = z.object({
  dob: preprocessDate,

  countryCode: z.string().min(1),
  contactNumber: z.string().min(1).regex(/^\d+$/),

  emergencyCountryCode: z.string().min(1),
  emergencyContactNumber: z.string().min(1),

  identificationNumber: z.string().min(1),
  nationality: z.string().min(1),
  occupation: z.string().min(1),

  gender: z.enum(Gender),

  residentialAddress: z.string().min(1).optional().nullable(),

  otherInterests: z.string().min(1).optional().nullable(),
  otherReferrers: z.string().min(1).optional().nullable(),
  otherContactModes: z.string().min(1).optional().nullable(),

  hasVolunteerExperience: z.boolean().optional().default(false),
  volunteerAvailability: z.string().min(1),

  isActive: z.boolean().optional().default(true),
  consentUpdatesCommunications: z.boolean(),
  subscribeNewsletterEvents: z.boolean().optional().default(false),

  // relations (arrays of IDs)
  skills: z.array(z.string().min(1)).default([]),
  languages: z.array(z.string().min(1)).default([]),

  contactModes: z.array(z.enum(ContactMode)).default([]),
  interests: z.array(z.enum(InterestSlug)).default([]),
});

// schemas used for route body validation only
export const StaffProfileSchema = UserOnlyProfileSchema;
export const PartnerProfileSchema = UserOnlyProfileSchema.and(PartnerOnlyProfileSchema);

// final profile data type for Staff/ Partner
export type StaffProfile = UserOnlyProfile;
export type PartnerProfile = z.infer<typeof PartnerProfileSchema>;

// profile types used for updating Partner profile
export type UserOnlyProfile = z.infer<typeof UserOnlyProfileSchema>;
export type PartnerOnlyProfile = z.infer<typeof PartnerOnlyProfileSchema>;
