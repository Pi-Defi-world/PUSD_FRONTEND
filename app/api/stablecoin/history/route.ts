import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward the origin header
    const origin = request.headers.get('origin');
    if (origin) {
      headers['Origin'] = origin;
    }
    
    const url = limit 
      ? `${SERVER_API_URL}/api/stablecoin/history?limit=${limit}`
      : `${SERVER_API_URL}/api/stablecoin/history`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Transaction history proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transaction history',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

