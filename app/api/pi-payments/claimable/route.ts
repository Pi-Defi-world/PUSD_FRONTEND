import { NextRequest, NextResponse } from 'next/server';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET(request: NextRequest) {
  if (!SERVER_API_URL) {
    return NextResponse.json(
      { success: false, error: 'Backend URL not configured (NEXT_PUBLIC_SERVER_URL)' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${SERVER_API_URL}/api/pi-payments/claimable`, {
      headers: {
        ...(request.headers.get('authorization') ? { authorization: request.headers.get('authorization')! } : {}),
      },
      cache: 'no-store',
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'A2U request failed' },
      { status: 500 }
    );
  }
}
