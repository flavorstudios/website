
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
  const sessionCookie = request.headers.get('cookie')?.split('; ').find(c => c.startsWith('session='))?.split('=')[1] || '';

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ uid: decodedClaims.uid });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
