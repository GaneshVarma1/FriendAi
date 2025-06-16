import { NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'google-tts-key.json',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('TTS request body:', body);
    const { text } = body;
    if (!text) {
      console.error('No text provided in request');
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    if (!response.audioContent) {
      throw new Error('No audio content returned from Google TTS');
    }

    return new NextResponse(Buffer.from(response.audioContent as Uint8Array), {
      headers: {
        'Content-Type': 'audio/mp3',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 