import { hashPassword, verifyPassword } from '../utils/password';
import { getPasswordResetToken, signToken, verifyToken } from '../utils/jwt';
import { ForbiddenError, UnauthorizedError, BadRequestError } from '../utils/errors';
import {
  PartnerData,
  createUserWithPartner,
  createPartnerWithUser,
  findUserByEmailWithRoles,
  findUserByIdWithRoles,
} from '../models/partner.model';
import { sendPasswordResetEmail } from '../utils/email';
import { updatePassword } from '../models/general.model';
import { prisma } from '../prisma/client';

/**
 * Check if a user has completed onboarding (has a Partner profile)
 */
async function checkHasOnboarded(userId: string): Promise<boolean> {
  const partner = await prisma.partner.findUnique({
    where: { userId },
    select: { id: true },
  });
  return partner !== null;
}

/**
 * Basic signup - creates User only, without Partner profile
 * User must complete onboarding separately
 */
export async function signupBasic(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  if (email.endsWith('@siloamxperience.org')) {
    throw new ForbiddenError('Staff accounts cannot sign up publicly');
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Account already exists');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      // role defaults to 'partner' via schema default
    },
    select: {
      id: true,
      role: true,
    },
  });

  // Create token for the new user (hasOnboarded = false since no Partner yet)
  const token = signToken({
    userId: user.id,
    role: user.role,
    hasOnboarded: false,
  });

  return token;
}

/**
 * Complete onboarding - creates Partner profile for existing User
 */
export async function completeOnboarding(
  userId: string,
  partnerData: PartnerData
) {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Check if already onboarded
  const existingPartner = await prisma.partner.findUnique({
    where: { userId },
  });

  if (existingPartner) {
    throw new BadRequestError('User has already completed onboarding');
  }

  // Create partner profile
  await prisma.$transaction(async (tx) => {
    await createPartnerWithUser(tx, userId, partnerData);
  });

  // Return new token with hasOnboarded = true
  const token = signToken({
    userId: user.id,
    role: user.role,
    hasOnboarded: true,
  });

  return token;
}

export async function signupPartnerWithOnboarding(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  partnerData: PartnerData
) {
  if (email.endsWith('@siloamxperience.org')) {
    throw new ForbiddenError('Staff accounts cannot sign up publicly');
  }

  const passwordHash = await hashPassword(password);

  const user = await createUserWithPartner(
    firstName,
    lastName,
    email,
    passwordHash,
    partnerData
  );

  // Create token for the new user
  const token = signToken({
    userId: user.id,
    role: user.role,
    hasOnboarded: true,
  });

  return token;
}

export async function login(email: string, password: string) {
  const user = await findUserByEmailWithRoles(email);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if user has completed onboarding (has Partner profile)
  // Non-partner roles (admin, manager) are considered onboarded by default
  const hasOnboarded = user.role !== 'partner' || await checkHasOnboarded(user.id);

  if (user.mustChangePassword) {

    const token = signToken({
      userId: user.id,
      role: user.role,
      hasOnboarded: false,
      firstLogin: true
    });

    return {
      mustChangePassword: true,
      token
    };
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    hasOnboarded,
  });

  return { token };
}

export async function requestPasswordResetService(email: string) {
  const user = await findUserByEmailWithRoles(email);

  if (!user) {
    throw new UnauthorizedError('This email is not registered');
  }

  const token = await getPasswordResetToken(user.id, user.role);

  // TODO: create frontend landing page
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  const resetURL = `${FRONTEND_URL}/reset-password?id=${user.id}&token=${token}`;

  await sendPasswordResetEmail(user.email, resetURL);
}

// Actual password reset function
export async function resetPasswordService(
  userId: string,
  token: string,
  newPassword: string
) {
  const user = await findUserByIdWithRoles(userId);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!token) {
    throw new UnauthorizedError('Token required');
  }

  const verify = await verifyToken(token);
  if (!verify || verify.userId !== userId) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  // For first login password change, ensure the token is a first-login token
  if (user.mustChangePassword && !verify.firstLogin) {
    throw new ForbiddenError('Invalid token for first login password change');
  }

  const passwordHash = await hashPassword(newPassword);

  await updatePassword(userId, passwordHash);
}
