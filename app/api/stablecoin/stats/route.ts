import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET() {
  try {
    const response = await fetch(`${SERVER_API_URL}/api/health/stats`);
    const data = await response.json();
    
    // Add testnet flag to response if successful
    if (data.success && data.data) {
      const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';
      data.data.isTestnet = isTestnet;
    }
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Stats proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
