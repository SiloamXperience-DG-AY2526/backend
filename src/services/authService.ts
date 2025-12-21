import { prisma } from '../prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { submitPartnerOnboarding } from './onboardingService';

export async function signupPartnerWithOnboarding(
  name: string,
  email: string,
  password: string,
  formId: string,
  responses: { fieldId: string; value?: string; optionId?: string }[]
) {
  if (email.endsWith('@siloamxperience.org')) {
    throw new Error('Staff accounts cannot sign up publicly');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Account already exists');
  }

  const passwordHash = await hashPassword(password);

  const partnerRole = await prisma.role.findFirst({
    where: { roleName: 'PARTNER' },
  });

  if (!partnerRole) {
    throw new Error('Partner role does not exist. Seed roles first.');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        roles: {
          create: {
            role: { connect: { id: partnerRole.id } },
          },
        },
      },
    });

    // Ensure all the referenced fields exist
    const fieldIds = responses.map((r) => r.fieldId);
    const fields = await tx.field.findMany({
      where: { id: { in: fieldIds } },
    });

    // Check if the fields match the responses
    if (fields.length !== responses.length) {
      throw new Error('One or more fields referenced in the responses do not exist.');
    }

    // Create a form submission from onboarding
    const formSubmission = await submitPartnerOnboarding(
      user.id,
      formId,
      responses,
      tx  // Pass the transaction context
    );

    // Create the partner
    const partner = await tx.partner.create({
      data: {
        user: { connect: { id: user.id } },
        formSubmission: { connect: { id: formSubmission.id } },
      },
    });

    // Check if partner creation was successful
    if (!partner) {
      throw new Error('Partner creation failed');
    }

    // Create token for the new user
    const token = signToken({
      userId: user.id,
      roles: ['PARTNER'],
    });

    return token;
  });
  return result;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: { include: { role: true } },
    },
  });

  if (!user) {
    throw new Error('Invalid email');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const roles = user.roles.map(r => r.role.roleName);

  const token = signToken({
    userId: user.id,
    roles,
  });

  return token;
}
