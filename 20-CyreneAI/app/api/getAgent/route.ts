// app/api/getAgent/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');  // Get the query parameter

  if (!id) {
    return NextResponse.json({ message: 'Agent ID is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/agents/us01.erebrus.io/${id}`);
    // Return the agent data
    return NextResponse.json(response.data.agent || null, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch agent:', error);
    return NextResponse.json({ message: 'Failed to fetch agent' }, { status: 500 });
  }
}
