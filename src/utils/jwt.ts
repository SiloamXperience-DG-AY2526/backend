import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1d';

export interface JwtPayload {
  userId: string;
  roles: string[];
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // ensures the payload is object rather than string
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('userId' in payload) ||
      !('roles' in payload)
    ) {
      throw new Error();
    }
    // handle missing fields
    const { userId, roles } = payload as Partial<JwtPayload>;
    //ensure correct shape of userId
    if (!userId || typeof userId !== 'string') {
      throw new Error();
    }

    // ensures correct shape of roles, ok to allow a role that is not typeof Role as it can
    // be handled by authorisation.
    if (!Array.isArray(roles)) {
      throw new Error();
    }
    return Object.freeze({ userId, roles }) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
