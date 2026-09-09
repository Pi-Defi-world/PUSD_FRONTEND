import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;
    
    if (!address) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing address parameter',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }
    
    const response = await fetch(`${SERVER_API_URL}/api/balance/check/${address}`);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Balance check proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check balance',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
