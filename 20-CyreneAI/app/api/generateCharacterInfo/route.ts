// app/api/generateCharacterInfo/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { oneLiner, description } = await request.json();

    const prompt = `Generate a character's bio, lore, and knowledge based on the following one-liner and description:
    
    One Liner: ${oneLiner}
    Description: ${description}

    Please provide the following:
    - Bio: A brief background of the character.
    - Lore: The character's history and backstory.
    - Knowledge: What the character knows or specializes in.

    Format the response as a JSON object with the keys "bio", "lore", and "knowledge".`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use the basic model
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content;
    const parsedResponse = JSON.parse(generatedText || '{}');

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error generating character info:', error);
    return NextResponse.json(
      { error: 'Failed to generate character information' },
      { status: 500 }
    );
  }
}