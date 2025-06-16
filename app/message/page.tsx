'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Home, Smile, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChatHeader } from '@/components/ui/chat-header';
import { useUser } from '@clerk/nextjs';
import { MessageLoading } from '@/components/ui/message-loading';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: "Hi there! 👋 I'm your AI friend. How are you doing today?",
    isUser: false,
    timestamp: new Date()
  },
  {
    id: '2',
    content: "Feel free to chat with me about anything - I'm here to help, listen, and have a friendly conversation!",
    isUser: false,
    timestamp: new Date()
  }
];

export default function MessagePage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: `Hi there${user?.firstName ? `, ${user.firstName}` : ''}! 👋 I'm your AI friend. How are you doing today?`,
    isUser: false,
    timestamp: new Date()
  }, {
    id: '2',
    content: `Feel free to chat with me about anything${user?.firstName ? `, ${user.firstName}` : ''} - I'm here to help, listen, and have a friendly conversation!`,
    isUser: false,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Format conversation history for the API
      const history = messages.map(msg => ({
        role: msg.isUser ? 'User' : 'Assistant',
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: history
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickReplies = [
    { icon: Smile, text: "How are you?", color: "from-yellow-500 to-orange-500" },
    { icon: Heart, text: "Tell me something nice", color: "from-pink-500 to-red-500" },
    { icon: Zap, text: "What's exciting today?", color: "from-purple-500 to-blue-500" }
  ];

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              {message.isUser && user?.firstName && (
                <div className="text-xs text-muted-foreground mb-1 ml-auto w-max max-w-[80%] text-right">
                  {user.firstName}
                </div>
              )}
              {!message.isUser && (
                <div className="text-xs text-muted-foreground mb-1 mr-auto w-max max-w-[80%] text-left">
                  Friend AI
                </div>
              )}
              <div
                className={cn(
                  'flex w-max max-w-[80%] rounded-lg px-4 py-2',
                  message.isUser ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div>
              <div className="text-xs text-muted-foreground mb-1 mr-auto w-max max-w-[80%] text-left">
                Friend AI
              </div>
              <div className="flex w-max max-w-[80%] rounded-lg bg-muted px-4 py-2 mr-auto">
                <MessageLoading />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <div className="text-xs text-muted-foreground text-center mt-2">
          built by <a href="https://srishiram.xyz" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">this guy</a>
        </div>
      </div>
    </div>
  );
}