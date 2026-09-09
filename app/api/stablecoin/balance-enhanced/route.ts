import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing address parameter',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }
    
    const response = await fetch(`${SERVER_API_URL}/api/balance/enhanced/${address}`);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Enhanced balance proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch enhanced balance',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
