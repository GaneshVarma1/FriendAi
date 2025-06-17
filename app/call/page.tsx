'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { ChatHeader } from '@/components/ui/chat-header';
import { useUser } from '@clerk/nextjs';
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';

export default function CallPage() {
    const { user } = useUser();
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<AudioBuffer[]>([]);
    const isProcessingRef = useRef(false);

    // Initialize audio context
    useEffect(() => {
        audioContextRef.current = new AudioContext();
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Configure MediaRecorder with specific audio settings
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 16000
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    // Process the audio chunk immediately
                    const audioBlob = new Blob([event.data], { type: 'audio/webm;codecs=opus' });
                    await processAudio(audioBlob);
                }
            };

            setIsCallActive(true);
            setIsListening(true);
            // Record in smaller chunks (500ms) for more real-time response
            mediaRecorder.start(500);
        } catch (error) {
            console.error('Error starting call:', error);
        }
    };

    const stopCall = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsCallActive(false);
        setIsListening(false);
        setIsSpeaking(false);
        setIsThinking(false);
        setTranscript('');
        setAiResponse('');
        audioChunksRef.current = [];
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        try {
            console.log('Starting audio processing...');
            setIsThinking(true);
            
            // Convert audio to WAV format
            const processingContext = new AudioContext();
            const arrayBuffer = await audioBlob.arrayBuffer();
            const decodedBuffer = await processingContext.decodeAudioData(arrayBuffer);
            
            // Create WAV file
            const wavBlob = await convertToWav(decodedBuffer);
            console.log('Converted to WAV format, size:', wavBlob.size);

            // Convert audio to text
            const formData = new FormData();
            formData.append('audio', wavBlob, 'audio.wav');
            console.log('Sending audio to STT API...');

            const sttResponse = await fetch('/api/stt', {
                method: 'POST',
                body: formData,
            });

            if (!sttResponse.ok) {
                const errorData = await sttResponse.text();
                console.error('STT API Error:', errorData);
                setIsThinking(false);
                return;
            }

            const { text } = await sttResponse.json();
            console.log('STT Response:', text);
            
            if (!text || text.trim() === '') {
                console.log('Empty transcript, skipping AI response');
                setIsThinking(false);
                return;
            }

            setTranscript(text);

            // Get AI response
            console.log('Sending to AI API...');
            const chatResponse = await fetch('/api/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    history: [],
                }),
            });

            if (!chatResponse.ok) {
                const errorData = await chatResponse.text();
                console.error('AI API Error:', errorData);
                setIsThinking(false);
                return;
            }

            const { response } = await chatResponse.json();
            console.log('AI Response:', response);
            
            if (!response || response.trim() === '') {
                console.log('Empty AI response, skipping TTS');
                setIsThinking(false);
                return;
            }

            setAiResponse(response);

            // Convert AI response to speech
            console.log('Sending to TTS API...');
            const ttsResponse = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: response }),
            });

            if (!ttsResponse.ok) {
                const errorData = await ttsResponse.text();
                console.error('TTS API Error:', errorData);
                setIsThinking(false);
                return;
            }

            const audioBuffer = await ttsResponse.arrayBuffer();
            console.log('Received audio buffer of size:', audioBuffer.byteLength);
            
            const audioContext = audioContextRef.current;
            if (!audioContext) {
                console.error('Audio context not available');
                setIsThinking(false);
                return;
            }

            const playbackBuffer = await audioContext.decodeAudioData(audioBuffer);
            console.log('Audio data decoded successfully');
            audioQueueRef.current.push(playbackBuffer);
            
            if (!isProcessingRef.current) {
                console.log('Starting audio playback...');
                playNextInQueue();
            }
            setIsThinking(false);
        } catch (error) {
            console.error('Error in processAudio:', error);
            setIsThinking(false);
        }
    };

    const playNextInQueue = async () => {
        if (audioQueueRef.current.length === 0) {
            isProcessingRef.current = false;
            setIsSpeaking(false);
            return;
        }

        isProcessingRef.current = true;
        setIsSpeaking(true);

        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        const audioBuffer = audioQueueRef.current.shift();
        if (!audioBuffer) return;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
            playNextInQueue();
        };

        source.start(0);
    };

    // Add this new function to convert audio to WAV format
    const convertToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const dataLength = audioBuffer.length * numChannels * bytesPerSample;
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);
        
        // RIFF identifier
        writeString(view, 0, 'RIFF');
        // RIFF chunk length
        view.setUint32(4, 36 + dataLength, true);
        // RIFF type
        writeString(view, 8, 'WAVE');
        // format chunk identifier
        writeString(view, 12, 'fmt ');
        // format chunk length
        view.setUint32(16, 16, true);
        // sample format (raw)
        view.setUint16(20, format, true);
        // channel count
        view.setUint16(22, numChannels, true);
        // sample rate
        view.setUint32(24, sampleRate, true);
        // byte rate (sample rate * block align)
        view.setUint32(28, sampleRate * blockAlign, true);
        // block align (channel count * bytes per sample)
        view.setUint16(32, blockAlign, true);
        // bits per sample
        view.setUint16(34, bitDepth, true);
        // data chunk identifier
        writeString(view, 36, 'data');
        // data chunk length
        view.setUint32(40, dataLength, true);
        
        // Write the PCM samples
        const offset = 44;
        const channelData = [];
        for (let i = 0; i < numChannels; i++) {
            channelData.push(audioBuffer.getChannelData(i));
        }
        
        let pos = 0;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
                const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset + pos, value, true);
                pos += 2;
            }
        }
        
        return new Blob([buffer], { type: 'audio/wav' });
    };

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    return (
        <>
            <SignedIn>
                <div className="flex h-screen flex-col bg-background">
                    <ChatHeader />
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <Phone className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-2xl font-semibold">
                                {user?.firstName ? `Hi ${user.firstName}, ` : ''}Voice Call with AI
                            </h1>
                            <p className="text-muted-foreground max-w-md">
                                Have a natural conversation with your AI friend. Click the button below to start.
                            </p>
                            
                            {/* Call Controls */}
                            <div className="flex gap-4 justify-center">
                                <Button
                                    size="lg"
                                    variant={isCallActive ? "destructive" : "default"}
                                    onClick={isCallActive ? stopCall : startCall}
                                    className="gap-2"
                                >
                                    {isCallActive ? "End Call" : "Start Call"}
                                </Button>
                                {isCallActive && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={toggleMute}
                                        className="gap-2"
                                    >
                                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        {isMuted ? "Unmute" : "Mute"}
                                    </Button>
                                )}
                            </div>

                            {/* Status Indicators */}
                            {isCallActive && (
                                <div className="flex gap-4 justify-center text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                        {isListening ? "Listening..." : "Not listening"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                        {isSpeaking ? "AI Speaking..." : "AI Silent"}
                                    </div>
                                </div>
                            )}

                            {/* Transcript and Response */}
                            {(transcript || aiResponse) && (
                                <div className="mt-8 space-y-4 max-w-md mx-auto">
                                    {transcript && (
                                        <div className="text-left">
                                            <p className="text-sm text-muted-foreground">You said:</p>
                                            <p className="mt-1">{transcript}</p>
                                        </div>
                                    )}
                                    {aiResponse && (
                                        <div className="text-left">
                                            <p className="text-sm text-muted-foreground">AI response:</p>
                                            <p className="mt-1">{aiResponse}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
}