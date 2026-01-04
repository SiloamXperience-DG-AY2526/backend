import { prisma } from "../lib/prisma";

export const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
