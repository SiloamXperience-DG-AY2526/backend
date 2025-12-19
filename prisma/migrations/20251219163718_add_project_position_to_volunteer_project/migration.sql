/*
  Warnings:

  - Added the required column `projectPositionId` to the `volunteer_projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "volunteer_projects" ADD COLUMN     "projectPositionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "volunteer_projects" ADD CONSTRAINT "volunteer_projects_projectPositionId_fkey" FOREIGN KEY ("projectPositionId") REFERENCES "project_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
