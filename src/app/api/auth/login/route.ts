import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

const COOKIE_NAME = 'auth_token';
const EXPIRY_DAYS = 15;

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('CRITICAL: ADMIN_PASSWORD is missing');
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    if (username !== adminUser || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    try {
      const token = await createToken(username);
      const response = NextResponse.json({ success: true });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: EXPIRY_DAYS * 24 * 60 * 60,
        path: '/',
      });
      return response;
    } catch (e) {
      console.error('Token error:', e);
      return NextResponse.json({ error: 'Token error' }, { status: 500 });
    }

  } catch (error) {
    console.error('Login route crashed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

