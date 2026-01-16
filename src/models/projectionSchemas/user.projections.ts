import { Prisma } from '@prisma/client';

export const PMPublicSelect = {
  id: true,
  firstName: true,
  lastName: true,
} satisfies Prisma.UserSelect;
