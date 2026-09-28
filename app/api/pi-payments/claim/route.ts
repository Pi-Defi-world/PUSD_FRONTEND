import { NextRequest, NextResponse } from 'next/server';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function POST(request: NextRequest) {
  if (!SERVER_API_URL) {
    return NextResponse.json(
      { success: false, error: 'Backend URL not configured (NEXT_PUBLIC_SERVER_URL)' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${SERVER_API_URL}/api/pi-payments/claim`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(request.headers.get('authorization') ? { authorization: request.headers.get('authorization')! } : {}),
      },
      body: await request.text(),
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
