import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { PartnerData, createUserWithPartner, findUserByEmailWithRoles } from '../models/partner.model';

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

  const user = await createUserWithPartner(firstName, lastName, email, passwordHash, partnerData);

  // Create token for the new user
  const token = signToken({
    userId: user.id,
    roles: user.roles.map((r: any) => r.role.roleName),
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

  const roles = user.roles.map((r: { role: { roleName: string } }) => r.role.roleName);

  const token = signToken({
    userId: user.id,
    roles,
  });

  return token;
}
