import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET() {
  try {
    if (!SERVER_API_URL) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Backend URL not configured (NEXT_PUBLIC_SERVER_URL)',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
    const response = await fetch(`${SERVER_API_URL}/api/health/price`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Health price proxy error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Pi price',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
