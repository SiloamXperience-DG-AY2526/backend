import "dotenv/config";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./errors";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "1d";

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function getPasswordResetToken(userId: string, role: string) {
  // token by role
  const token = signToken({
    userId,
    role,
  });

  return token;
}
export function verifyToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // ensures the payload is object rather than string
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("userId" in payload) ||
      !("role" in payload)
    ) {
      throw new Error();
    }
    // handle missing fields
    const { userId, role } = payload as Partial<JwtPayload>;
    //ensure correct shape of userId
    if (!userId || typeof userId !== "string") {
      throw new Error();
    }

    // ensure correct shape of role
    if (!role || typeof role !== "string") {
      throw new Error();
    }
    return Object.freeze({ userId, role }) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
