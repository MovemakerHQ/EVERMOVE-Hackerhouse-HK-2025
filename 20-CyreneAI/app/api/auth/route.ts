// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { verifyMessage } from 'ethers';
import { PublicKey, Transaction } from '@solana/web3.js';

export async function POST(req: Request) {
  const { walletAddress, chain, signature, message } = await req.json();

  try {
    let isValid = false;

    if (chain === 'ethereum') {
      // Verify Ethereum signature
      const recoveredAddress = verifyMessage(message, signature);
      isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } else if (chain === 'solana') {
      // Verify Solana signature
      const publicKey = new PublicKey(walletAddress);
      const transaction = Transaction.from(Buffer.from(signature, 'base64'));
      isValid = transaction.verifySignatures();
    }

    if (isValid) {
      // Generate a token (e.g., JWT) and return it
      const token = 'your_generated_token';
      return NextResponse.json({ token });
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}