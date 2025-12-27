-- CreateEnum
CREATE TYPE "DonationFrequency" AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('individual', 'fundraising', 'corporate');

-- CreateEnum
CREATE TYPE "RecurringDonationStatus" AS ENUM ('active', 'paused', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted', 'withdrawn');

-- CreateEnum
CREATE TYPE "DonationVerificationStatus" AS ENUM ('pending', 'received', 'cancelled');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('brick', 'sponsor', 'partner_led');

-- CreateEnum
CREATE TYPE "ProjectApprovalStatus" AS ENUM ('pending', 'reviewing', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'others');

-- CreateEnum
CREATE TYPE "ContactModeType" AS ENUM ('email', 'whatsapp', 'telegram', 'messenger', 'phone_call');

-- CreateEnum
CREATE TYPE "InterestSlug" AS ENUM ('fundraise', 'plan_trips', 'mission_trips', 'long_term', 'admin', 'publicity', 'teaching', 'training', 'agriculture', 'building', 'others');

-- CreateEnum
CREATE TYPE "ReferrerType" AS ENUM ('friend', 'social_media', 'church', 'website', 'event', 'other');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('scheduled', 'attempted', 'cancelled');

-- CreateEnum
CREATE TYPE "EmailRecipientStatus" AS ENUM ('scheduled', 'pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "EmailRecipientType" AS ENUM ('to', 'cc', 'bcc');

-- CreateEnum
CREATE TYPE "VolunteerProjectPositionStatus" AS ENUM ('reviewing', 'approved', 'rejected', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "ProjectFrequency" AS ENUM ('once', 'daily', 'weekly', 'monthly', 'yearly');

-- CreateEnum
CREATE TYPE "ProjectOperationStatus" AS ENUM ('ongoing', 'paused', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "PartnerFeedbackType" AS ENUM ('supervisor', 'peer', 'self');

-- CreateTable
CREATE TABLE "recurring_donations" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "DonationType" NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "scheduledAmount" DECIMAL(12,2) NOT NULL,
    "frequency" "DonationFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAutoDeducted" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecurringDonationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_transactions" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "recurringDonationId" TEXT,
    "type" "DonationType" NOT NULL,
    "countryOfResidence" TEXT NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "receipt" TEXT,
    "isThankYouSent" BOOLEAN NOT NULL DEFAULT false,
    "isAdminNotified" BOOLEAN NOT NULL DEFAULT false,
    "submissionStatus" "SubmissionStatus" NOT NULL,
    "verificationStatus" "DonationVerificationStatus" NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "don_projects" (
    "id" TEXT NOT NULL,
    "managedBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "beneficiaries" TEXT,
    "initiatorName" TEXT,
    "organisingTeam" TEXT,
    "targetFund" DECIMAL(12,2),
    "brickSize" DECIMAL(12,2),
    "deadline" TIMESTAMP(3),
    "type" "ProjectType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "submissionStatus" "SubmissionStatus" NOT NULL,
    "approvalStatus" "ProjectApprovalStatus" NOT NULL,
    "approvalNotes" TEXT,
    "image" TEXT,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "don_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "don_project_objectives" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "don_project_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripFormId" TEXT,
    "dob" TIMESTAMP(3),
    "countryCode" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "emergencyCountryCode" TEXT NOT NULL,
    "emergencyContactNumber" TEXT NOT NULL,
    "identificationNumber" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "residentialAddress" TEXT,
    "otherInterests" TEXT,
    "otherReferrers" TEXT,
    "otherContactModes" TEXT,
    "hasVolunteerExperience" BOOLEAN NOT NULL DEFAULT false,
    "volunteerAvailability" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "consentUpdatesCommunications" BOOLEAN NOT NULL,
    "subscribeNewsletterEvents" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_forms" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "passportExpiry" TIMESTAMP(3) NOT NULL,
    "healthDeclaration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_skills" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,

    CONSTRAINT "partner_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_modes" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "mode" "ContactModeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "interestSlug" "InterestSlug" NOT NULL,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrers" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "referrer" "ReferrerType" NOT NULL,

    CONSTRAINT "referrers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "body" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "scheduledAt" TIMESTAMP(3),

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_recipients" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "type" "EmailRecipientType" NOT NULL,
    "status" "EmailRecipientStatus" NOT NULL,

    CONSTRAINT "email_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vol_projects" (
    "id" TEXT NOT NULL,
    "managedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "aboutDesc" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "beneficiaries" TEXT NOT NULL,
    "initiatorName" TEXT,
    "organisingTeam" TEXT,
    "proposedPlan" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "frequency" "ProjectFrequency" NOT NULL,
    "interval" INTEGER,
    "dayOfWeek" TEXT,
    "submissionStatus" TEXT NOT NULL,
    "approvalStatus" "ProjectApprovalStatus" NOT NULL,
    "operationStatus" "ProjectOperationStatus" NOT NULL,
    "approvalNotes" TEXT,
    "approvalMessage" TEXT,
    "image" TEXT,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vol_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_sessions" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "has_rsvp" BOOLEAN,
    "has_attended" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_positions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalSlots" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_skills" (
    "id" TEXT NOT NULL,
    "projectPositionId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_project_positions" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "availability" TEXT,
    "status" "VolunteerProjectPositionStatus" NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvalNotes" TEXT,
    "approvalMessage" TEXT,
    "hasConsented" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "volunteerProjectFeedbackId" TEXT,

    CONSTRAINT "volunteer_project_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vol_project_objectives" (
    "id" TEXT NOT NULL,
    "volunteerProjectId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vol_project_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vol_project_feedback" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "managementRating" INTEGER NOT NULL,
    "planningRating" INTEGER NOT NULL,
    "resourcesRating" INTEGER NOT NULL,
    "enjoyMost" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "otherComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vol_project_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_feedback" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "type" "PartnerFeedbackType" NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peer_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_tags" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "feedback_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "don_project_objectives_projectId_order_key" ON "don_project_objectives"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "partners_userId_key" ON "partners"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_forms_partnerId_key" ON "trip_forms"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_sessions_volunteerId_sessionId_key" ON "volunteer_sessions"("volunteerId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "project_skills_projectPositionId_order_key" ON "project_skills"("projectPositionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_project_positions_volunteerId_positionId_key" ON "volunteer_project_positions"("volunteerId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "vol_project_objectives_volunteerProjectId_order_key" ON "vol_project_objectives"("volunteerProjectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "peer_feedback_reviewerId_revieweeId_projectId_type_key" ON "peer_feedback"("reviewerId", "revieweeId", "projectId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- AddForeignKey
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "don_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_transactions" ADD CONSTRAINT "donation_transactions_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_transactions" ADD CONSTRAINT "donation_transactions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "don_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_transactions" ADD CONSTRAINT "donation_transactions_recurringDonationId_fkey" FOREIGN KEY ("recurringDonationId") REFERENCES "recurring_donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_projects" ADD CONSTRAINT "don_projects_managedBy_fkey" FOREIGN KEY ("managedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_project_objectives" ADD CONSTRAINT "don_project_objectives_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "don_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_forms" ADD CONSTRAINT "trip_forms_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_skills" ADD CONSTRAINT "partner_skills_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "languages" ADD CONSTRAINT "languages_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_modes" ADD CONSTRAINT "contact_modes_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests" ADD CONSTRAINT "interests_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrers" ADD CONSTRAINT "referrers_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_recipients" ADD CONSTRAINT "email_recipients_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vol_projects" ADD CONSTRAINT "vol_projects_managedById_fkey" FOREIGN KEY ("managedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vol_projects" ADD CONSTRAINT "vol_projects_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "vol_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_sessions" ADD CONSTRAINT "volunteer_sessions_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_sessions" ADD CONSTRAINT "volunteer_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_sessions" ADD CONSTRAINT "volunteer_sessions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_positions" ADD CONSTRAINT "project_positions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "vol_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_projectPositionId_fkey" FOREIGN KEY ("projectPositionId") REFERENCES "project_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_project_positions" ADD CONSTRAINT "volunteer_project_positions_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_project_positions" ADD CONSTRAINT "volunteer_project_positions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "project_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_project_positions" ADD CONSTRAINT "volunteer_project_positions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_project_positions" ADD CONSTRAINT "volunteer_project_positions_volunteerProjectFeedbackId_fkey" FOREIGN KEY ("volunteerProjectFeedbackId") REFERENCES "vol_project_feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vol_project_objectives" ADD CONSTRAINT "vol_project_objectives_volunteerProjectId_fkey" FOREIGN KEY ("volunteerProjectId") REFERENCES "vol_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vol_project_feedback" ADD CONSTRAINT "vol_project_feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "vol_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_feedback" ADD CONSTRAINT "peer_feedback_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_feedback" ADD CONSTRAINT "peer_feedback_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_feedback" ADD CONSTRAINT "peer_feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "vol_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_tags" ADD CONSTRAINT "feedback_tags_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "peer_feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_tags" ADD CONSTRAINT "feedback_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
