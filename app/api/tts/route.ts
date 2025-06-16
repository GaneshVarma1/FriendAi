import { NextResponse } from 'next/server';

// Using a more reliable and accessible model
const HF_API_URL = "https://api-inference.huggingface.co/models/speechbrain/tts-tacotron2-ljspeech";
const HF_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

export async function POST(req: Request) {
    try {
        console.log('TTS API called');
        console.log('API Key available:', !!HF_API_KEY);

        if (!HF_API_KEY) {
            console.error('NEXT_PUBLIC_HUGGINGFACE_API_KEY is not set');
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        console.log('Request body:', body);
        
        const { text } = body;
        if (!text) {
            console.error('No text provided in request');
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        console.log('Sending request to Hugging Face TTS API...');
        console.log('Request URL:', HF_API_URL);
        console.log('Request text:', text);

        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
        });

        console.log('Hugging Face API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', errorText);
            console.error('Response status:', response.status);
            console.error('Response headers:', Object.fromEntries(response.headers.entries()));
            throw new Error(`Failed to generate speech: ${response.status} ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        console.log('Received audio buffer of size:', audioBuffer.byteLength);

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/wav',
            },
        });
    } catch (error) {
        console.error('TTS Error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate speech' },
            { status: 500 }
        );
    }
} 