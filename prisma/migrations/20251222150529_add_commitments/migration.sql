/*
  Warnings:

  - You are about to alter the column `amount` on the `disbursements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `donation_transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to drop the column `totalAllocatedFunds` on the `projects` table. All the data in the column will be lost.
  - You are about to alter the column `scheduledAmount` on the `recurring_donations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - Added the required column `fiscalYear` to the `disbursements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `disbursements` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVAL', 'RELEASED', 'REJECTED');

-- AlterTable
ALTER TABLE "disbursements" ADD COLUMN     "disbursedAt" TIMESTAMP(3),
ADD COLUMN     "fiscalYear" INTEGER NOT NULL,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "status" "FundStatus" NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "donation_transactions" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "totalAllocatedFunds",
ADD COLUMN     "targetFund" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "recurring_donations" ALTER COLUMN "scheduledAmount" SET DATA TYPE DECIMAL(12,2);

-- CreateTable
CREATE TABLE "commitments" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT,
    "fiscalYear" INTEGER NOT NULL,
    "status" "FundStatus" NOT NULL,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commitments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
