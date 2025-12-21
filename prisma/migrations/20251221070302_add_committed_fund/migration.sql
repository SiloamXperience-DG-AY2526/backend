/*
  Warnings:

  - You are about to drop the column `totalAllocatedFunds` on the `projects` table. All the data in the column will be lost.
  - Added the required column `fiscalYear` to the `disbursements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `disbursements` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVAL', 'RELEASED', 'REJECTED');

-- AlterTable
ALTER TABLE "disbursements" ADD COLUMN     "disbursedAt" TIMESTAMP(3),
ADD COLUMN     "fiscalYear" INTEGER NOT NULL,
ADD COLUMN     "status" "FundStatus" NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "totalAllocatedFunds";

-- CreateTable
CREATE TABLE "commitments" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
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
