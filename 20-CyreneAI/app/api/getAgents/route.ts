import { NextResponse } from 'next/server';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(req: Request) {
  try {
    // Make the request to the external API
    const response = await axios.get(`${API_BASE_URL}/agents/us01.erebrus.io`);
    
    // Return the data from the API
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json({ message: 'Failed to fetch agents' }, { status: 500 });
  }
}
