import axios from 'axios';
import { NextResponse } from 'next/server';

const MESSAGE_API_URL = process.env.MESSAGE_API_URL; 
const AGENT_ID = process.env.CYRENE_AI_ID;

export async function POST(req: Request) {
  try {
    const messageData = await req.formData();  
    console.log('messageData', `${MESSAGE_API_URL}/${AGENT_ID}/message`);
    const response = await axios.post(`${MESSAGE_API_URL}/${AGENT_ID}/message`, messageData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Error:', error); 
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}
