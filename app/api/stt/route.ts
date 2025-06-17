import { NextResponse } from 'next/server';

const HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export async function POST(req: Request) {
    try {
        if (!HF_API_KEY) {
            console.error('HUGGINGFACE_API_KEY is not set');
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'Audio file is required' },
                { status: 400 }
            );
        }

        console.log('Received audio file:', audioFile.type, audioFile.size);
        const audioBuffer = await audioFile.arrayBuffer();

        console.log('Sending request to Hugging Face STT API...');
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': audioFile.type,
            },
            body: audioBuffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', errorText);
            throw new Error(`Failed to transcribe speech: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('Transcription result:', result);

        if (!result.text) {
            throw new Error('No transcription received');
        }

        return NextResponse.json({ text: result.text });
    } catch (error) {
        console.error('STT Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to transcribe speech' },
            { status: 500 }
        );
    }
} 