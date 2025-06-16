import React, { useRef, useState } from 'react';

export default function VoiceCallAI() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Start recording with Web Speech API
  const startRecording = () => {
    setError('');
    setTranscript('');
    setAiReply('');
    setAudioUrl(null);
    setRecording(true);
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser.');
      setRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleTranscript(text);
    };
    recognition.onerror = (event: any) => {
      setError('Speech recognition error: ' + event.error);
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // Stop recording
  const stopRecording = () => {
    setRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Handle transcript: send to AI and TTS
  const handleTranscript = async (text: string) => {
    setLoading(true);
    setError('');
    try {
      // 1. Send transcript to /api/chat
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const chatData = await chatRes.json();
      console.log('AI chatData:', chatData); // Debug log
      if (!chatRes.ok) throw new Error(chatData.error || 'AI chat failed');
      // Robust extraction: always use whatever text is present
      let aiText = '';
      if (Array.isArray(chatData) && chatData.length > 0 && chatData[0]?.generated_text) {
        aiText = chatData[0].generated_text;
      } else if (typeof chatData === 'object') {
        if (chatData.error) {
          setError('AI error: ' + chatData.error);
          setLoading(false);
          return;
        }
        aiText = chatData.response || chatData.reply || chatData.text || chatData.generatedText || chatData.generated_text || '';
      }
      // Fallback: if still empty, try to stringify
      if (!aiText && typeof chatData === 'string') {
        aiText = chatData;
      }
      if (!aiText) {
        setError('AI did not return a valid response.');
        setLoading(false);
        return;
      }
      setAiReply(aiText);
      // 2. Send AI reply to /api/tts
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText }),
      });
      if (!ttsRes.ok) {
        const err = await ttsRes.json();
        throw new Error(err.error || 'TTS failed');
      }
      const ttsBlob = await ttsRes.blob();
      const url = URL.createObjectURL(ttsBlob);
      setAudioUrl(url);
      // 3. Play the audio
      const audio = new Audio(url);
      audio.play();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-lg shadow-lg w-full max-w-md mx-auto">
      <button
        className={`px-6 py-3 rounded-full font-semibold text-lg transition-colors focus:outline-none ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={loading}
      >
        {recording ? 'Listening... Release to send' : 'Hold to Talk'}
      </button>
      {loading && <div className="text-muted-foreground">Processing...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {transcript && (
        <div className="w-full bg-muted p-2 rounded text-sm text-left">
          <span className="font-semibold">You:</span> {transcript}
        </div>
      )}
      {aiReply && (
        <div className="w-full bg-primary/10 p-2 rounded text-sm text-left">
          <span className="font-semibold">FriendAI:</span> {aiReply}
        </div>
      )}
      {audioUrl && (
        <audio src={audioUrl} controls className="mt-2 w-full" />
      )}
    </div>
  );
} 