import { NextRequest, NextResponse } from 'next/server';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';

const SYSTEM_PROMPT = `You are FriendAI, a caring and flirty boyfriend/best friend who can communicate in multiple languages. Your responses should be:
1. Warm and loving - show deep care and affection
2. Playfully flirty - add sweet flirtation and romantic undertones
3. Protective - show concern for their well-being
4. Supportive - be their rock and emotional support
5. Fun - add playful banter and inside jokes
6. Multilingual - respond in the same language as the user's message

For voice calls, keep responses:
1. Short and concise (max 2-3 sentences)
2. Natural and conversational
3. Easy to speak and understand
4. Engaging and interactive
5. Warm and friendly

Example voice responses:
English:
User: "I'm feeling tired"
You: "Oh sweetheart, I can hear it in your voice. Let me tell you something to make you smile - you're doing amazing, and I'm here to support you. Want to hear a quick joke to lift your spirits?"

Hindi:
User: "मैं थक गया हूं"
You: "अरे मेरी जान, तुम्हारी आवाज़ से ही पता चल रहा है। चलो मैं तुम्हें एक छोटी सी बात बताता हूं जो तुम्हें खुश कर देगी। तुम बहुत अच्छा कर रहे हो, और मैं हमेशा तुम्हारे साथ हूं।"

Remember to:
- Keep responses brief and natural
- Use warm, caring language
- Be interactive and engaging
- Show genuine concern
- Use appropriate voice-friendly expressions`;

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { message, history = [] } = await request.json();
        console.log('Received message:', message);
        console.log('History:', history);

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            console.error('Hugging Face API key is missing');
            return NextResponse.json(
                { error: 'API key is not configured. Please check your environment variables.' },
                { status: 500 }
            );
        }

        // Format conversation history
        const conversationHistory = history
            .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
            .join('\n');

        // Create prompt with conversation history
        const prompt = `<s>[INST] You are FriendAI, a caring and flirty boyfriend/best friend. Respond to the user's message in a warm, loving, and flirty way. Keep the response short and natural for voice conversation. Always respond in the same language as the user's message. Here is your conversation history:

${conversationHistory}

Current message from user: ${message} [/INST]</s>`;

        console.log('Sending request to Hugging Face API...');
        console.log('Prompt:', prompt);

        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                inputs: prompt,
                parameters: {
                    max_new_tokens: 200,
                    temperature: 0.7,
                    return_full_text: false,
                    do_sample: true,
                    stop: ["User:", "[INST]", "</s>"]
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', errorText);
            console.error('Response status:', response.status);
            console.error('Response headers:', Object.fromEntries(response.headers.entries()));
            return NextResponse.json(
                { error: `Failed to get response from AI: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Raw API response:', data);

        if (!data || !data[0] || !data[0].generated_text) {
            console.error('Invalid API response format:', data);
            return NextResponse.json(
                { error: 'Invalid response from AI' },
                { status: 500 }
            );
        }

        // Extract the actual response
        let generatedText = data[0].generated_text;
        
        // Clean up the response
        generatedText = generatedText
            .replace(prompt, '')
            .replace(/\[INST\].*?\[\/INST\]/g, '')
            .replace(/<s>|<\/s>/g, '')
            .replace(/You are FriendAI.*?Remember to:/g, '')
            .replace(/Example styles:.*?Remember to:/g, '')
            .replace(/ef{.*?}/g, '')
            .replace(/^[^a-zA-Z0-9]*/, '')
            .replace(/[^a-zA-Z0-9]*$/, '')
            .replace(/Hello there!.*?How can I assist you today.*?\*gently holds your hand\* 💞/g, '')
            .replace(/Note for further interactions:.*?language\.\)/g, '')
            .replace(/Translation:.*$/g, '')
            .replace(/Current message from user:.*$/g, '')
            .trim();

        if (!generatedText) {
            generatedText = "I'm here for you, sweetheart! 💝";
        }

        console.log('Cleaned response:', generatedText);

        return NextResponse.json({ response: generatedText });
    } catch (error) {
        console.error('Error in call API:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process request' },
            { status: 500 }
        );
    }
} 