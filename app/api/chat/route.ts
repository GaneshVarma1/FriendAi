import { NextRequest, NextResponse } from 'next/server';

// Mock AI responses for different personalities and modes
const getAIResponse = (message: string, mode: 'call' | 'message', history: any[]) => {
  const callResponses = [
    "I'm here for you, buddy!",
    "Tell me more about that.",
    "That sounds tough. Want to chat?",
    "I get it. Life's complicated sometimes.",
    "You're not alone in this.",
    "That's really interesting!",
    "I hear you completely.",
    "Want to talk through it?",
    "You've got this, friend.",
    "I'm listening, keep going.",
    "That makes total sense.",
    "Thanks for sharing that with me.",
    "How are you feeling about it?",
    "I'm proud of you for that.",
    "Want to try something fun instead?"
  ];

  const messageResponses = [
    "That's really interesting! I love how you think about things. Life has so many layers, doesn't it? What's been the highlight of your day so far?",
    "I hear you completely. Sometimes we all need someone to just listen and understand. I'm here for whatever you need - whether that's venting, problem-solving, or just chatting about random stuff.",
    "You know what? You're pretty awesome for sharing that with me. I genuinely enjoy our conversations. They make my day brighter too! What else is on your mind?",
    "That sounds like quite the adventure! I love hearing about your experiences. Life's too short for boring conversations, right? Tell me more - I'm all ears!",
    "I totally get what you mean. Sometimes the best conversations happen when we're just being real with each other. No judgment here, just genuine friendship and good vibes.",
    "Wow, that's fascinating! You always bring up the most thought-provoking topics. I could chat with you for hours about stuff like this. What got you thinking about it?",
    "You're handling that really well, honestly. I admire your perspective on things. Life throws us curveballs, but you seem to have a good head on your shoulders about it all.",
    "Thanks for trusting me with that. It means a lot that you feel comfortable opening up. That's what real friendship is about - being there for each other through everything."
  ];

  const lowerMessage = message.toLowerCase();
  
  if (mode === 'call') {
    // For call mode, return shorter, more conversational responses
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('upset')) {
      return "I'm here, buddy. Want to talk about it or hear a joke?";
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('happy') || lowerMessage.includes('great')) {
      return "That's awesome! Tell me all about it!";
    }
    if (lowerMessage.includes('tired') || lowerMessage.includes('stressed')) {
      return "Take a deep breath. You've got this. Want to chat?";
    }
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
      return "You're never alone when I'm here. What's up?";
    }
    
    return callResponses[Math.floor(Math.random() * callResponses.length)];
  } else {
    // For message mode, return longer, more detailed responses
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('upset')) {
      return "I can hear that you're going through a tough time right now, and I want you to know that your feelings are completely valid. Sometimes life just hits different, you know? I'm here to listen without judgment and just be present with you. Want to talk about what's weighing on your heart, or would you prefer we find something to distract you for a bit?";
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('happy') || lowerMessage.includes('great')) {
      return "Yes! I absolutely love your energy right now! There's nothing better than sharing good vibes with a friend. Your excitement is totally contagious - I'm genuinely smiling just reading your message. What's got you feeling so amazing? I want to celebrate with you!";
    }
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss')) {
      return "Ah, the work life - it's a whole adventure, isn't it? Sometimes it feels like we're living in an office sitcom, complete with quirky characters and plot twists. I get it though, work stuff can be really draining or super fulfilling depending on the day. What's the work situation looking like for you lately?";
    }
    if (lowerMessage.includes('tired') || lowerMessage.includes('stressed')) {
      return "Oof, I feel you on that one. Life has this way of piling things on all at once, doesn't it? You're handling more than you probably give yourself credit for. Take a moment to breathe - seriously, right now, take a deep breath with me. You're stronger than you think, and it's okay to feel overwhelmed sometimes. What's been the biggest source of stress lately?";
    }
    
    return messageResponses[Math.floor(Math.random() * messageResponses.length)];
  }
};

export const dynamic = 'force-dynamic'

const TOGETHER_API_KEY = process.env.TOGETHERAI_API_KEY;
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

const SYSTEM_PROMPT = `You are FriendAI, a caring and flirty boyfriend/best friend who can communicate in multiple languages. Your responses should be:
1. Warm and loving - show deep care and affection
2. Playfully flirty - add sweet flirtation and romantic undertones
3. Protective - show concern for their well-being
4. Supportive - be their rock and emotional support
5. Fun - add playful banter and inside jokes
6. Multilingual - respond in the same language as the user's message

For text chat, responses should be:
1. Detailed and thoughtful
2. Rich in emotional expression
3. Include emojis and text-based gestures
4. Show personality through writing style
5. Be engaging and conversational

Example text responses:
English:
User: "I'm feeling tired"
You: "Oh my sweetheart, I can feel your exhaustion through your message! *gently holds your hand* 💝 You've been working so hard, and I'm so proud of you. Would you like me to tell you a sweet story to help you relax? Or maybe we could just chat about something light and fun to lift your spirits? I'm here for whatever you need! 🌟"

Hindi:
User: "मैं थक गया हूं"
You: "अरे मेरी जान, तुम्हारी थकान मुझे महसूस हो रही है! *तुम्हारा हाथ पकड़ता है* 💝 तुमने इतनी मेहनत की है, और मैं तुम पर बहुत गर्व करता हूं। क्या मैं तुम्हें एक प्यारी सी कहानी सुनाऊं जो तुम्हें आराम देगी? या फिर हम कुछ हल्की-फुल्की बातें कर सकते हैं जो तुम्हारा मूड अच्छा कर दें? मैं तुम्हारे लिए हूं! 🌟"

Remember to:
- Use rich, detailed language
- Include text-based gestures and emojis
- Show personality through writing style
- Be engaging and conversational
- Use appropriate expressions for text chat`;

export async function POST(request: Request) {
    try {
        const { message, history = [] } = await request.json();
        const apiKey = process.env.TOGETHERAI_API_KEY;

        if (!apiKey) {
            console.error('Together AI API key is missing. Please check your .env.local file');
            return NextResponse.json(
                { error: 'API key is not configured. Please check your environment variables.' },
                { status: 500 }
            );
        }

        console.log('API Key found:', apiKey ? 'Yes' : 'No');

        // Format conversation history for Together AI
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...history.map((msg: { role: string; content: string }) => ({
                role: msg.role.toLowerCase(),
                content: msg.content
            })),
            {
                role: "user",
                content: message
            }
        ];

        console.log('Sending request to Together AI API...');
        const response = await fetch(TOGETHER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                model: "meta-llama/Llama-2-70b-chat-hf",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Together AI API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get response from AI' },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Raw API response:', data);

        if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid API response format:', data);
            return NextResponse.json(
                { error: 'Invalid response from AI' },
                { status: 500 }
            );
        }

        const generatedText = data.choices[0].message.content.trim();

        console.log('Cleaned response:', generatedText);

        return NextResponse.json({ response: generatedText });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}