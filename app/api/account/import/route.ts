import { NextRequest, NextResponse } from 'next/server';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mnemonic, secret } = body;

    if (!mnemonic && !secret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either mnemonic or secret is required',
        },
        { status: 400 }
      );
    }

    // Normalize mnemonic to lowercase if provided
    const normalizedBody: { mnemonic?: string; secret?: string } = {};
    if (mnemonic) {
      normalizedBody.mnemonic = mnemonic.trim().toLowerCase();
    }
    if (secret) {
      normalizedBody.secret = secret.trim();
    }

    const authHeader = request.headers.get('Authorization');

    const response = await fetch(`${SERVER_API_URL}/api/account/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'x-session-id': request.headers.get('x-session-id') || '',
      },
      body: JSON.stringify(normalizedBody),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Account import proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import account',
      },
      { status: 500 }
    );
  }
}




