
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = { 
      name: 'session', 
      value: sessionCookie, 
      maxAge: expiresIn, 
      httpOnly: true, 
      secure: true 
    };

    return new Response('Logged in', {
      status: 200,
      headers: { 'Set-Cookie': `${options.name}=${options.value}; Max-Age=${options.maxAge}; Path=/; HttpOnly; Secure` },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log in' }, { status: 401 });
  }
}
