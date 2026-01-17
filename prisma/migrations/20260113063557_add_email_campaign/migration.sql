-- CreateEnum
CREATE TYPE "EmailCampaignStatus" AS ENUM ('draft', 'scheduled', 'cancelled');

-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "subject" TEXT,
    "previewText" TEXT,
    "body" TEXT,
    "status" "EmailCampaignStatus" NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_audience_filters" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "projectId" TEXT,
    "isActivePartner" BOOLEAN,
    "gender" "Gender",
    "nationality" TEXT,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "volunteerInterests" "InterestSlug"[],
    "volunteerSkills" TEXT[],
    "languages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_audience_filters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_audience_filters_campaignId_key" ON "email_audience_filters"("campaignId");

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "email_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_audience_filters" ADD CONSTRAINT "email_audience_filters_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "email_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
