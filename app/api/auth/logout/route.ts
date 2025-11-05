
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const options = { 
    name: 'session', 
    value: '', 
    maxAge: -1, 
    httpOnly: true, 
    secure: true 
  };

  return new Response('Logged out', {
    status: 200,
    headers: { 'Set-Cookie': `${options.name}=${options.value}; Max-Age=${options.maxAge}; Path=/; HttpOnly; Secure` },
  });
}
