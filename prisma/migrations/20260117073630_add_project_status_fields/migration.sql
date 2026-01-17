/*
  Warnings:

  - The `submissionStatus` column on the `vol_projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- Add new enum value to ProjectOperationStatus in a separate transaction
ALTER TYPE "ProjectOperationStatus" ADD VALUE IF NOT EXISTS 'notStarted';

-- AlterTable
ALTER TABLE "don_projects" 
ADD COLUMN "operationStatus" "ProjectOperationStatus" NOT NULL DEFAULT 'ongoing',
ALTER COLUMN "submissionStatus" SET DEFAULT 'draft',
ALTER COLUMN "approvalStatus" SET DEFAULT 'pending';

-- Update existing rows to use notStarted for don_projects
UPDATE "don_projects" SET "operationStatus" = 'notStarted' WHERE "operationStatus" = 'ongoing';

-- AlterTable
ALTER TABLE "vol_projects" 
DROP COLUMN "submissionStatus",
ADD COLUMN "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'draft',
ALTER COLUMN "approvalStatus" SET DEFAULT 'pending',
ALTER COLUMN "operationStatus" SET DEFAULT 'notStarted';
