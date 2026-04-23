import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const COOKIE_NAME = 'auth_token';
const EXPIRY_DAYS = 15;

export interface UserSession {
  userId: string;
  username: string;
  name?: string;
  email?: string;
  picture?: string;
  provider?: 'credentials' | 'google';
}

export async function createToken(
  username: string,
  extra?: { userId?: string; name?: string; email?: string; picture?: string; provider?: string }
): Promise<string> {
  const payload: Record<string, unknown> = { username };
  if (extra) {
    if (extra.userId) payload.userId = extra.userId;
    if (extra.name) payload.name = extra.name;
    if (extra.email) payload.email = extra.email;
    if (extra.picture) payload.picture = extra.picture;
    if (extra.provider) payload.provider = extra.provider;
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY_DAYS}d`)
    .sign(JWT_SECRET);
  return token;
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      name: payload.name as string | undefined,
      email: payload.email as string | undefined,
      picture: payload.picture as string | undefined,
      provider: (payload.provider as 'credentials' | 'google') || 'credentials',
    };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<UserSession | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Helper for API routes: gets the authenticated user's ID or returns null.
 * Use this at the top of every API route to scope data to the current user.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}
