/*
  Warnings:

  - The `submissionStatus` column on the `vol_projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/

-- AlterTable
ALTER TABLE "don_projects" 
ADD COLUMN IF NOT EXISTS "operationStatus" "ProjectOperationStatus" NOT NULL DEFAULT 'ongoing',
ALTER COLUMN "submissionStatus" SET DEFAULT 'draft',
ALTER COLUMN "approvalStatus" SET DEFAULT 'pending';

-- Update the default to notStarted after adding the column
ALTER TABLE "don_projects" 
ALTER COLUMN "operationStatus" SET DEFAULT 'notStarted';

-- AlterTable
ALTER TABLE "vol_projects" 
DROP COLUMN IF EXISTS "submissionStatus",
ADD COLUMN "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'draft',
ALTER COLUMN "approvalStatus" SET DEFAULT 'pending',
ALTER COLUMN "operationStatus" SET DEFAULT 'notStarted';
