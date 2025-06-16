'use client'

import { useState, useEffect } from 'react';
import { ChatHeader } from "@/components/ui/chat-header";
import { Phone } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import { SocketProvider, useSocket } from './SignalingContext';
import VoiceCallAI from '@/components/ui/VoiceCallAI';

const CallPage = () => {
    const { user } = useUser();
    const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'connecting', 'in-call', 'ended'
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [aiResponse, setAiResponse] = useState('');
    const socket = useSocket();

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const startCall = async () => {
        try {
            setCallStatus('connecting');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            setCallStatus('in-call');
            // Simulate AI response for now
            setTimeout(() => {
                const response = `Hey ${user?.firstName || 'sweetie'}! I've been waiting for you. How can I make your day better?`;
                setAiResponse(response);
                speak(response);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setCallStatus('ended');
        }
    };

    const endCall = () => {
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            setAudioStream(null);
        }
        setCallStatus('ended');
        const goodbye = "I'll miss you! Take care and come back soon!";
        setAiResponse(goodbye);
        speak(goodbye);
    };

    return (
        <>
            <SignedIn>
                <div className="flex flex-col h-screen bg-background">
                    <ChatHeader />
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <VoiceCallAI />
                    </div>
                </div>
            </SignedIn>
            <SignedOut>
                <div className="flex items-center justify-center h-screen">
                    <SignIn routing="hash" />
                </div>
            </SignedOut>
        </>
    );
};

const CallPageWithSocket = () => (
  <SocketProvider>
    <CallPage />
  </SocketProvider>
);

export default CallPageWithSocket;