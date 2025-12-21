import { prisma } from '../prisma/client';

export async function submitPartnerOnboarding(
  userId: string,
  formId: string,
  responses: { fieldId: string; value?: string; optionId?: string }[],
  tx: any
) {
  return tx.submission.create({
    data: {
      user: { connect: { id: userId } },
      form: { connect: { id: formId } },
      responses: {
        create: responses.map((r) => ({
          field: { connect: { id: r.fieldId } },
          value: r.value,
          option: r.optionId
            ? { connect: { id: r.optionId } }
            : undefined,
        })),
      },
    },
  });
}

export async function getPartnerOnboarding(userId: string) {
  return prisma.submission.findMany({
    where: { userId },
    include: {
      form: true,
      responses: {
        include: {
          field: true,
          option: true,
        },
      },
    },
  });
}
