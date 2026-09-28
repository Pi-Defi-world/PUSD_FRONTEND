import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '');

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { success: false, error: 'Backend URL not configured (NEXT_PUBLIC_SERVER_URL)' },
      { status: 503 }
    );
  }

  try {
    const { accessToken } = (await request.json()) as { accessToken?: string };

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'accessToken is required' },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      },
      body: JSON.stringify({ accessToken }),
      cache: 'no-store',
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-in service unavailable',
      },
      { status: 500 }
    );
  }
}
