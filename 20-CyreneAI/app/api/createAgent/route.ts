import axios from 'axios';
import { NextResponse } from 'next/server';
import FormData from 'form-data';
import { Buffer } from 'buffer';

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const characterFileStr = formData.get('character_file') as string;
    const agentData = JSON.parse(characterFileStr);

    const modifiedAgentData = {
      ...agentData,
      settings: {
        secrets: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        },
        voice: {
          model: "en_US-male-medium",
        },
      },
      modelProvider: process.env.MODEL_PROVIDER,
    };

    const upstreamFormData = new FormData();
    
    const characterBlob = new Blob([JSON.stringify(modifiedAgentData)], { type: "application/json" });
    const characterBuffer = await new Response(characterBlob).arrayBuffer();
    const buffer = Buffer.from(characterBuffer);
    upstreamFormData.append("character_file", buffer, "agent.character.json");

    upstreamFormData.append("domain", formData.get('domain'));
    upstreamFormData.append("avatar_img", formData.get('avatar_img'));
    upstreamFormData.append("cover_img", formData.get('cover_img'));
    upstreamFormData.append("voice_model", formData.get('voice_model'));
    upstreamFormData.append("wallet_address", formData.get('wallet_address'));
    upstreamFormData.append("organization", "cyrene");

    const response = await axios.post(`${API_BASE_URL}/agents/us01.erebrus.io/`, upstreamFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...upstreamFormData.getHeaders(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data);
    } else {
      console.error("Error:", error);
    }
    return NextResponse.json({ message: 'Failed to create agent' }, { status: 500 });
  }
}