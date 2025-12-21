//if import from @prisma/client CI/CD fails hence created type files
export interface ProjectPosition {
id: string;
  projectId: string;
  title: string;
  slots: number;
  filled: number;
  createdAt: Date;
  updatedAt: Date;
}