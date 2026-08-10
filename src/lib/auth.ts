import bcrypt from 'bcryptjs';
import { signJWT, verifyJWT } from './auth-jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-please-change-this-in-production-12345';

// Hash a password using bcryptjs
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hashed version
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create a JWT session token containing user details
export async function createSessionToken(user: { id: string; name: string; email: string; role: string; agencyId: string | null }): Promise<string> {
  const payload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    agencyId: user.agencyId,
  };
  return signJWT(payload, JWT_SECRET);
}

// Verify a session token
export async function getSessionUser(token: string): Promise<{ userId: string; name: string; email: string; role: string; agencyId: string | null } | null> {
  return verifyJWT(token, JWT_SECRET);
}
