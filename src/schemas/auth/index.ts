import { z } from 'zod';

// Basic signup - just creates User, no Partner profile
export const basicSignupSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
});

// Onboarding - creates Partner profile for existing User
export const onboardingSchema = z.object({
  countryCode: z.string().min(1, 'Country code required'),
  contactNumber: z.string().min(4, 'Contact number required'),
  dob: z.preprocess(
    (arg) => (typeof arg === 'string' || arg instanceof Date ? new Date(arg as any) : undefined),
    z.date().optional()
  ),
  nationality: z.string().min(1, 'Nationality required'),
  occupation: z.string().min(1, 'Occupation required'),
  gender: z.enum(['male', 'female', 'others']),
  residentialAddress: z.string().optional(),
  emergencyCountryCode: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  identificationNumber: z.string().min(1, 'Identification number required'),
  otherInterests: z.string().optional(),
  otherReferrers: z.string().optional(),
  otherContactModes: z.string().optional(),
  hasVolunteerExperience: z.boolean().optional(),
  volunteerAvailability: z.string(),
  consentUpdatesCommunications: z.boolean(),
  subscribeNewsletterEvents: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
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
    .array(z.enum(['email', 'whatsapp', 'telegram', 'messenger', 'phoneCall']))
    .optional(),
  interests: z
    .array(
      z.enum([
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
      ])
    )
    .optional(),
  referrers: z
    .array(z.enum(['friend', 'socialMedia', 'church', 'website', 'event', 'other']))
    .optional(),
});

// Full signup with onboarding (legacy - creates User + Partner together)
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
    nationality: z.string().min(1, 'Nationality required'),
    occupation: z.string().min(1, 'Occupation required'),
    gender: z.enum(['male', 'female', 'others']),
    residentialAddress: z.string().optional(),
    emergencyCountryCode: z.string().optional(),
    emergencyContactNumber: z.string().optional(),
    identificationNumber: z.string().min(1, 'Identification number required'),
    otherInterests: z.string().optional(),
    otherReferrers: z.string().optional(),
    otherContactModes: z.string().optional(),
    hasVolunteerExperience: z.boolean().optional(),
    volunteerAvailability: z.string(),
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
      .array(z.enum(['email', 'whatsapp', 'telegram', 'messenger', 'phoneCall']))
      .optional(),
    interests: z
      .array(
        z.enum([
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
        ])
      )
      .optional(),
    referrers: z
      .array(z.enum(['friend', 'socialMedia', 'church', 'website', 'event', 'other']))
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
