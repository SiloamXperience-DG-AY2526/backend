import { hashPassword, verifyPassword } from '../utils/password';
import { getPasswordResetToken, signToken, verifyToken } from '../utils/jwt';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import {
  PartnerData,
  createUserWithPartner,
  findUserByEmailWithRoles,
  findUserByIdWithRoles,
} from '../models/partner.model';
import { sendPasswordResetEmail } from '../utils/email';
import { updatePassword } from '../models/general.model';

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

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return token;
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

  const verify = await verifyToken(token);

  if (!verify) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const passwordHash = await hashPassword(newPassword);

  await updatePassword(userId, passwordHash);
}
