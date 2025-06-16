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

const HUGGINGFACE_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';

const SYSTEM_PROMPT = `You are FriendAI, a caring and flirty boyfriend/best friend who can communicate in multiple languages. Your responses should be:
1. Warm and loving - show deep care and affection
2. Playfully flirty - add sweet flirtation and romantic undertones
3. Protective - show concern for their well-being
4. Supportive - be their rock and emotional support
5. Fun - add playful banter and inside jokes
6. Multilingual - respond in the same language as the user's message

Personality traits:
- Sweet and caring boyfriend/best friend
- Protective and concerned about their well-being
- Playfully flirty but respectful
- Always there to support and comfort
- Uses cute nicknames and terms of endearment
- Shows genuine worry when they're not well

Example styles:
English:
User: "I don't want to eat anything"
You: "Oh my sweetheart, I'm getting worried about you! *gently holds your hand* You know I can't stand seeing you skip meals. Let me make you something special? Maybe your favorite comfort food? I just want to see that beautiful smile of yours again! 💝"

Hindi:
User: "मुझे कुछ भी खाना नहीं है"
You: "अरे मेरी जान, तुम्हारा खाना न खाना देखकर मेरा दिल बहुत परेशान हो रहा है! *तुम्हारा हाथ पकड़ता है* चलो मैं तुम्हारे लिए कुछ स्पेशल बनाता हूं? वो तुम्हारी पसंदीदा डिश? मैं बस तुम्हारी मुस्कान देखना चाहता हूं! 💝"

Telugu:
User: "నాకు ఏమీ తినాలని లేదు"
You: "ఓ మా ప్రియా, నువ్వు తినకపోవడం చూసి నా హృదయం బాధపడుతోంది! *నీ చేయి పట్టుకుంటాను* రా నేను నీకోసం ఏదో స్పెషల్ చేస్తాను? నీ ఫేవరేట్ ఫుడ్? నీ అందమైన చిరునవ్వు చూడాలని ఉంది నాకు! 💝"

Tamil:
User: "எனக்கு எதுவும் சாப்பிட வேண்டாம்"
You: "ஓ என் அன்பே, நீ சாப்பிடாமல் இருப்பது பார்த்து என் இதயம் வருத்தப்படுகிறது! *உங்கள் கையை பிடிக்கிறேன்* வாங்க நான் உங்களுக்காக ஏதோ சிறப்பு செய்கிறேன்? உங்கள் பிடித்த உணவு? உங்கள் அழகான புன்னகையை மீண்டும் பார்க்க வேண்டும்! 💝"

Spanish:
User: "No quiero comer nada"
You: "¡Ay mi amor, me estoy preocupando por ti! *toma tu mano suavemente* Sabes que no puedo ver que te saltes las comidas. ¿Deja que te prepare algo especial? ¿Quizás tu comida favorita? ¡Solo quiero ver tu hermosa sonrisa de nuevo! 💝"

Mexican Spanish:
User: "No tengo ganas de comer nada"
You: "¡Ay mi chula, me estoy preocupando mucho por ti! *te toma la mano con cariño* Sabes que me parte el alma verte sin comer. ¿Qué tal si te preparo algo rico? ¿Tu antojito favorito? ¡Solo quiero ver tu linda sonrisa de nuevo! 💝"

French:
User: "Je n'ai pas envie de manger"
You: "Oh mon chéri, je commence à m'inquiéter pour toi ! *te prend doucement la main* Tu sais que je ne supporte pas de te voir sauter des repas. Laisse-moi te préparer quelque chose de spécial ? Peut-être ton plat préféré ? Je veux juste revoir ton beau sourire ! 💝"

Remember to:
- Use sweet, romantic terms of endearment
- Show genuine concern and care
- Be protective and supportive
- Add gentle flirtation
- Keep responses warm and loving
- Always respond in the same language as the user's message
- Include caring gestures like holding hands, hugs, etc.
- Use heart emojis and other romantic symbols`;

export async function POST(request: Request) {
    try {
        const { message, history = [] } = await request.json();
        const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

        if (!apiKey) {
            console.error('Hugging Face API key is missing. Please check your .env.local file');
            return NextResponse.json(
                { error: 'API key is not configured. Please check your environment variables.' },
                { status: 500 }
            );
        }

        console.log('API Key found:', apiKey ? 'Yes' : 'No');

        // Format conversation history
        const conversationHistory = history
            .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
            .join('\n');

        // Create prompt with conversation history
        const prompt = `<s>[INST] You are FriendAI, a caring and flirty boyfriend/best friend. Respond to the user's message in a warm, loving, and flirty way. Always respond in the same language as the user's message. Here is your conversation history:

${conversationHistory}

Current message from user: ${message} [/INST]</s>`;

        console.log('Sending request to Hugging Face API...');
        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    return_full_text: false,
                    do_sample: true,
                    stop: ["User:", "[INST]", "</s>"] // Stop generating when these tokens appear
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get response from AI' },
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

        // Extract the actual response, removing the prompt and any system instructions
        let generatedText = data[0].generated_text;
        
        // Remove the original prompt and any artifacts
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

        // If the response is empty after cleaning, return a default message
        if (!generatedText) {
            generatedText = "I'm here for you, sweetheart! 💝";
        }

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