import { NextResponse } from 'next/server';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        
        if (!text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            console.error('Hugging Face API key is not set');
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        console.log('TTS API called');
        console.log('API Key available:', !!apiKey);
        console.log('Request body:', { text });

        console.log('Sending request to Hugging Face TTS API...');
        console.log('Request URL:', HUGGINGFACE_API_URL);
        console.log('Request text:', text);

        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
            return NextResponse.json(
                { error: `Failed to generate speech: ${response.status} ${errorText}` },
                { status: response.status }
            );
        }

        const audioBuffer = await response.arrayBuffer();
        console.log('Received audio buffer of size:', audioBuffer.byteLength);

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('TTS Error:', error);
        return NextResponse.json(
            { error: 'Failed to process text-to-speech request' },
            { status: 500 }
        );
    }
} 