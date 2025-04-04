import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voice } = await req.json();
    const ttsApiUrl = process.env.TTS_API_URL;
    if (!ttsApiUrl) throw new Error('TTS API URL not configured');

    const response = await fetch(`${ttsApiUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "model": "kokoro",
        "input": text ,
        "voice": voice || "af_bella", 
        "response_format": "mp3",
        "download_format": "mp3",
        "speed": 1,
        "stream": true,
        "return_download_link": false,
        "lang_code": "a",
        "normalization_options": {
          "normalize": true,
          "unit_normalization": false,
          "url_normalization": true,
          "email_normalization": true,
          "optional_pluralization_normalization": true
        }
      }),
    });

    if (!response.ok) throw new Error('TTS API error');

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
  }
}