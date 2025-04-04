import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const response = await fetch('https://ipfs.erebrus.io/api/v0/add', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`IPFS server responded with ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('IPFS proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 }
    );
  }
} 