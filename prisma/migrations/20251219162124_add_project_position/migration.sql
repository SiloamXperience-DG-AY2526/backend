-- CreateTable
CREATE TABLE "project_positions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slots" INTEGER NOT NULL,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_positions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_positions" ADD CONSTRAINT "project_positions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
