import { PartnerOnlyProfile, PartnerProfile, UserOnlyProfile } from '../schemas/user';

export function splitPartnerProfile(
  partnerProfile: PartnerProfile
): {
  userOnlyProfile: UserOnlyProfile,
  partnerOnlyProfile: PartnerOnlyProfile
} {
  const userOnlyProfile = {
    firstName: partnerProfile.firstName,
    lastName: partnerProfile.lastName,
    email: partnerProfile.email,
    title: partnerProfile.title,
  };

  const partnerScalars = {
    dob: partnerProfile.dob,
    countryCode: partnerProfile.countryCode,
    contactNumber: partnerProfile.contactNumber,
    emergencyCountryCode: partnerProfile.emergencyCountryCode,
    emergencyContactNumber: partnerProfile.emergencyContactNumber,
    identificationNumber: partnerProfile.identificationNumber,
    nationality: partnerProfile.nationality,
    occupation: partnerProfile.occupation,
    gender: partnerProfile.gender,
    residentialAddress: partnerProfile.residentialAddress,
    otherInterests: partnerProfile.otherInterests,
    otherReferrers: partnerProfile.otherReferrers,
    otherContactModes: partnerProfile.otherContactModes,
    hasVolunteerExperience: partnerProfile.hasVolunteerExperience,
    volunteerAvailability: partnerProfile.volunteerAvailability,
    consentUpdatesCommunications: partnerProfile.consentUpdatesCommunications,
    subscribeNewsletterEvents: partnerProfile.subscribeNewsletterEvents,
  };

  const partnerRelations = {
    skills: partnerProfile.skills,
    languages: partnerProfile.languages,
    contactModes: partnerProfile.contactModes,
    interests: partnerProfile.interests,
  };

  const partnerOnlyProfile = { ...partnerScalars, ...partnerRelations };

  return { userOnlyProfile, partnerOnlyProfile };
}





