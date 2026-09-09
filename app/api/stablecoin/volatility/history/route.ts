import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = searchParams.get('hours') || '24';
    
    const token = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${SERVER_API_URL}/api/stablecoin/volatility/history?hours=${hours}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Volatility history proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch volatility history',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

