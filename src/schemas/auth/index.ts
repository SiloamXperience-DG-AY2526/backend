import { z } from 'zod';

export const partnerSignupSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  partner: z.object({
    countryCode: z.string().min(1, 'Country code required'),
    contactNumber: z.string().min(4, 'Contact number required'),
    dob: z.preprocess(
      (arg) => (typeof arg === 'string' || arg instanceof Date ? new Date(arg as any) : undefined),
      z.date().optional()
    ),
    nationality: z.string().optional(),
    occupation: z.string().optional(),
    gender: z.enum(['male', 'female', 'others']),
    residentialAddress: z.string().optional(),
    emergencyCountryCode: z.string().optional(),
    emergencyContactNumber: z.string().optional(),
    identificationNumber: z.string().optional(),
    otherInterests: z.string().optional(),
    otherReferrers: z.string().optional(),
    otherContactModes: z.string().optional(),
    hasVolunteerExperience: z.boolean().optional(),
    volunteerAvailability: z.string(),
    isActive: z.boolean().optional(),
    consentUpdatesCommunications: z.boolean(),
    subscribeNewsletterEvents: z.boolean().optional(),
    // Related lists
    skills: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    // Optional trip form data
    tripForm: z
      .object({
        fullName: z.string().min(1),
        passportNumber: z.string().min(1),
        passportExpiry: z.preprocess(
          (arg) => (typeof arg === 'string' || arg instanceof Date ? new Date(arg as any) : arg),
          z.date()
        ),
        healthDeclaration: z.string().optional(),
      })
      .optional(),
    contactModes: z
      .array(z.enum(['email', 'whatsapp', 'telegram', 'messenger', 'phone_call']))
      .optional(),
    interests: z
      .array(
        z.enum([
          'fundraise',
          'plan_trips',
          'mission_trips',
          'long_term',
          'admin',
          'publicity',
          'teaching',
          'training',
          'agriculture',
          'building',
          'others',
        ])
      )
      .optional(),
    referrers: z
      .array(z.enum(['friend', 'social_media', 'church', 'website', 'event', 'other']))
      .optional(),
  }),
});

export const requestPasswordResetSchema = z.object({
  email: z.email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
});