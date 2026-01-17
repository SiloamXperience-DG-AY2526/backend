-- AlterEnum
-- Add new enum value to ProjectOperationStatus
ALTER TYPE "ProjectOperationStatus" ADD VALUE IF NOT EXISTS 'notStarted';
