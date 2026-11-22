import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get from cookie
  const cookieToken = request.cookies.get('auth_token')?.value;
  return cookieToken || null;
}

export function requireAuth(request: NextRequest): NextResponse | null {
  const token = getAuthToken(request);

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized - No token provided' },
      { status: 401 }
    );
  }

  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid token' },
      { status: 401 }
    );
  }

  return null; // Auth successful
}

