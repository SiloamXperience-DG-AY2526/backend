/*
  Warnings:

  - The values [phone_call] on the enum `ContactModeType` will be removed. If these variants are still used in the database, this will fail.
  - The values [plan_trips,mission_trips,long_term] on the enum `InterestSlug` will be removed. If these variants are still used in the database, this will fail.
  - The values [partner_led] on the enum `ProjectType` will be removed. If these variants are still used in the database, this will fail.
  - The values [social_media] on the enum `ReferrerType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('superAdmin', 'generalManager', 'financeManager', 'partner');

-- AlterEnum
BEGIN;
CREATE TYPE "ContactModeType_new" AS ENUM ('email', 'whatsapp', 'telegram', 'messenger', 'phoneCall');
ALTER TABLE "contact_modes" ALTER COLUMN "mode" TYPE "ContactModeType_new" USING ("mode"::text::"ContactModeType_new");
ALTER TYPE "ContactModeType" RENAME TO "ContactModeType_old";
ALTER TYPE "ContactModeType_new" RENAME TO "ContactModeType";
DROP TYPE "public"."ContactModeType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "InterestSlug_new" AS ENUM ('fundraise', 'planTrips', 'missionTrips', 'longTerm', 'admin', 'publicity', 'teaching', 'training', 'agriculture', 'building', 'others');
ALTER TABLE "interests" ALTER COLUMN "interestSlug" TYPE "InterestSlug_new" USING ("interestSlug"::text::"InterestSlug_new");
ALTER TYPE "InterestSlug" RENAME TO "InterestSlug_old";
ALTER TYPE "InterestSlug_new" RENAME TO "InterestSlug";
DROP TYPE "public"."InterestSlug_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectType_new" AS ENUM ('brick', 'sponsor', 'partnerLed');
ALTER TABLE "don_projects" ALTER COLUMN "type" TYPE "ProjectType_new" USING ("type"::text::"ProjectType_new");
ALTER TYPE "ProjectType" RENAME TO "ProjectType_old";
ALTER TYPE "ProjectType_new" RENAME TO "ProjectType";
DROP TYPE "public"."ProjectType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReferrerType_new" AS ENUM ('friend', 'socialMedia', 'church', 'website', 'event', 'other');
ALTER TABLE "referrers" ALTER COLUMN "referrer" TYPE "ReferrerType_new" USING ("referrer"::text::"ReferrerType_new");
ALTER TYPE "ReferrerType" RENAME TO "ReferrerType_old";
ALTER TYPE "ReferrerType_new" RENAME TO "ReferrerType";
DROP TYPE "public"."ReferrerType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'partner';

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "user_roles";
