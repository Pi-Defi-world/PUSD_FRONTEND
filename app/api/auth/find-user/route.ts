import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL ;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { piUsername } = body;

    if (!piUsername) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Forward origin and referer headers for proper WebAuthn RP ID detection
    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    const authHeader = request.headers.get('Authorization');
    const origin = originHeader ||
                   (refererHeader ? new URL(refererHeader).origin : '') ||
                   (request.url ? new URL(request.url).origin : '') ||
                   '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(authHeader ? { 'Authorization': authHeader } : {}),
      'x-session-id': request.headers.get('x-session-id') || '',
    };

    if (origin) {
      headers['origin'] = origin;
      headers['referer'] = refererHeader || origin;
    }

    // Call the backend to find user by username
    const serverResponse = await fetch(`${BACKEND_URL}/api/auth/find-user`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ piUsername }),
    });

    const data = await serverResponse.json();

    if (!serverResponse.ok) {
      return NextResponse.json(data, { status: serverResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error finding user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to find user',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
