import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const COOKIE_NAME = 'auth_token';
const EXPIRY_DAYS = 15;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', baseUrl));
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', baseUrl));
    }

    const tokenData = await tokenRes.json();

    // Fetch user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error('User info fetch failed');
      return NextResponse.redirect(new URL('/login?error=user_info_failed', baseUrl));
    }

    const userInfo = await userInfoRes.json();

    // Find or create user in database
    await dbConnect();
    let user = await User.findOne({ email: userInfo.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: userInfo.email.toLowerCase(),
        name: userInfo.name,
        picture: userInfo.picture || '',
        provider: 'google',
      });
    } else {
      // Update profile picture and name on each login
      user.name = userInfo.name;
      user.picture = userInfo.picture || '';
      await user.save();
    }

    // Create a JWT with the user info including userId
    const token = await createToken(userInfo.email, {
      userId: user._id.toString(),
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      provider: 'google',
    });

    // Set auth cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', baseUrl));
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=server_error', baseUrl));
  }
}
