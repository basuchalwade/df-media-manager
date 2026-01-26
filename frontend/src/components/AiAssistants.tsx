
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Mic, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { api } from '../services/api';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- Chatbot Component ---
const Chatbot: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Prepare history for API
            const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            const responseText = await api.chat(userMsg, history);
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 h-[500px] animate-in slide-in-from-bottom-10">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18} /> AI Assistant</h3>
                <button onClick={onClose}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        <p>Ask me anything about your campaigns or content strategy!</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="flex justify-start"><div className="bg-gray-200 p-2 rounded-xl"><Loader2 className="w-4 h-4 animate-spin text-gray-500" /></div></div>}
            </div>
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input 
                    className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} disabled={loading || !input} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"><Send size={16} /></button>
            </div>
        </div>
    );
};

// --- Live Voice Component ---
const LiveVoice: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [transcription, setTranscription] = useState('');
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const wsRef = useRef<any>(null); // Placeholder for session

    const startSession = async () => {
        setStatus('connecting');
        try {
            const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API Key missing");

            const ai = new GoogleGenAI({ apiKey });
            
            // Audio setup
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = outputAudioContext;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('active');
                        // Input Processing
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const b64 = btoa(String.fromCharCode(...new Uint8Array(Int16Array.from(inputData.map(n => n * 32767)).buffer)));
                            sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b64 } }));
                            // Fake volume viz
                            setVolume(Math.random() * 100);
                        };
                        source.connect(processor);
                        processor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                       // Output Processing
                       const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                       if (audioData) {
                           const binary = atob(audioData);
                           const len = binary.length;
                           const bytes = new Uint8Array(len);
                           for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
                           
                           const int16 = new Int16Array(bytes.buffer);
                           const float32 = new Float32Array(int16.length);
                           for(let i=0; i<int16.length; i++) float32[i] = int16[i] / 32768.0;

                           const buffer = outputAudioContext.createBuffer(1, float32.length, 24000);
                           buffer.copyToChannel(float32, 0);
                           
                           const source = outputAudioContext.createBufferSource();
                           source.buffer = buffer;
                           source.connect(outputAudioContext.destination);
                           source.start();
                           activeSourceRef.current = source;
                       }
                    },
                    onclose: () => setStatus('idle'),
                    onerror: () => setStatus('error')
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
                }
            });
            wsRef.current = sessionPromise;

        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    const stopSession = () => {
        // Cleanup logic would go here (close stream, disconnect session)
        setStatus('idle');
        onClose();
        if(audioContextRef.current) audioContextRef.current.close();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in">
            <div className="flex flex-col items-center gap-8 text-white">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${status === 'active' ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] scale-110' : 'bg-gray-800'}`}>
                    <Mic size={48} className={status === 'active' ? 'animate-pulse' : ''} />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Live Voice Mode</h2>
                    <p className="text-gray-400">
                        {status === 'connecting' ? 'Connecting to Gemini...' : 
                         status === 'active' ? 'Listening...' : 
                         status === 'error' ? 'Connection Failed' : 'Ready'}
                    </p>
                </div>
                <div className="flex gap-4">
                    {status === 'idle' && <button onClick={startSession} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200">Start Conversation</button>}
                    <button onClick={stopSession} className="px-8 py-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-full font-bold hover:bg-red-600/30">End Session</button>
                </div>
            </div>
        </div>
    );
};

export const AiAssistants: React.FC = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
                <button 
                    onClick={() => setVoiceOpen(true)}
                    className="w-14 h-14 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-red-600 transition-transform hover:scale-105 active:scale-95"
                    title="Live Voice"
                >
                    <Mic size={24} />
                </button>
                <button 
                    onClick={() => setChatOpen(!chatOpen)}
                    className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95"
                    title="Chat Assistant"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
            
            <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
            <LiveVoice isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
        </>
    );
};
