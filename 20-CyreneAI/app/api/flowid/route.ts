// app/api/flowid/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');
  const chain = searchParams.get('chain');

  if (!walletAddress || !chain) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const flowId = Math.random().toString(36).substring(7);
  const eula = 'Please sign this message to authenticate with CyreneAI.';

  return NextResponse.json({ flowId, eula });
}