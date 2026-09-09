import { NextResponse } from 'next/server';

 
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
