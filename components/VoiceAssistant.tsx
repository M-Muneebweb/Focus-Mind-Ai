import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, Volume2, X, BrainCircuit, Activity } from 'lucide-react';
import { interpretVoiceCommand } from '../services/aiService';

interface VoiceAssistantProps {
    onCommand: (action: string, payload?: any) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand }) => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);
    
    // Store position
    const [pos, setPos] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('voice_pos');
                if (saved) return JSON.parse(saved);
            } catch (e) {}
            return { top: window.innerHeight - 120, left: window.innerWidth - 100 };
        }
        return { top: 0, left: 0 };
    });

    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false); // Track if actual movement occurred
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
            } else {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US'; 

                recognition.onstart = () => {
                    setStatus('listening');
                    setShowTooltip(false);
                };

                recognition.onend = () => {
                    if(status === 'listening') setStatus('idle');
                };

                recognition.onresult = async (event: any) => {
                    const text = event.results[0][0].transcript;
                    setTranscript(text);
                    setStatus('thinking');
                    
                    try {
                        const result = await interpretVoiceCommand(text, () => {});
                        console.log("Voice Result:", result);

                        const execute = () => {
                            setStatus('idle');
                            onCommand(result.action, result.payload);
                        };

                        // Safety check: Don't speak generic phrases for commands
                        let speechText = result.speech;
                        const forbiddenPhrases = ["generating", "opening", "working", "sure", "okay", "starting"];
                        if (result.action !== 'CHAT_QUERY' && result.action !== 'NONE') {
                            if (speechText && forbiddenPhrases.some(p => speechText.toLowerCase().includes(p))) {
                                speechText = ""; // Suppress
                            }
                        }

                        if (speechText) {
                            speak(speechText, execute);
                        } else {
                            execute();
                        }

                    } catch (error) {
                        console.error(error);
                        speak("Sorry, I encountered an error.", () => setStatus('idle'));
                    }
                };
                recognitionRef.current = recognition;
            }

            const handleResize = () => {
                setPos((prev: any) => ({
                    top: Math.min(prev.top, window.innerHeight - 100),
                    left: Math.min(prev.left, window.innerWidth - 100)
                }));
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [onCommand, status]);

    const speak = (text: string, onEnd: () => void) => {
        if (!text) {
            onEnd();
            return;
        }
        setAiResponse(text);
        setStatus('speaking');
        
        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        // Add a slight delay before triggering end to ensure UI updates
        utterance.onend = () => {
            setTimeout(() => {
                setAiResponse('');
                onEnd();
            }, 300);
        };
        utterance.onerror = () => {
             setAiResponse('');
             onEnd();
        };
        window.speechSynthesis.speak(utterance);
    };

    // --- Drag Handlers ---
    
    // Initialize drag vars but don't set state yet
    const startDrag = (clientX: number, clientY: number) => {
        dragOffset.current = { x: clientX - pos.left, y: clientY - pos.top };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button.close-btn')) return;
        // Allow dragging regardless of status, or keep restriction if preferred. 
        if (status !== 'idle' && status !== 'speaking' && status !== 'listening' && status !== 'thinking') return; 
        
        e.preventDefault();
        hasMoved.current = false;
        startDrag(e.clientX, e.clientY);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('button.close-btn')) return;
        const touch = e.touches[0];
        hasMoved.current = false;
        startDrag(touch.clientX, touch.clientY);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
    };

    const onMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        hasMoved.current = true;
        if (!isDragging) setIsDragging(true); // Only set state if not already set to avoid re-renders
        
        const newLeft = e.clientX - dragOffset.current.x;
        const newTop = e.clientY - dragOffset.current.y;
        setPos({
            left: Math.max(20, Math.min(newLeft, window.innerWidth - 80)),
            top: Math.max(20, Math.min(newTop, window.innerHeight - 80))
        });
    };

    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        hasMoved.current = true;
        if (!isDragging) setIsDragging(true);

        const touch = e.touches[0];
        const newLeft = touch.clientX - dragOffset.current.x;
        const newTop = touch.clientY - dragOffset.current.y;
        setPos({
            left: Math.max(20, Math.min(newLeft, window.innerWidth - 80)),
            top: Math.max(20, Math.min(newTop, window.innerHeight - 80))
        });
    };

    const onMouseUp = () => {
        if (isDragging) setIsDragging(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    const onTouchEnd = () => {
        if (isDragging) setIsDragging(false);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
    };

    useEffect(() => {
        if (!isDragging && hasMoved.current) localStorage.setItem('voice_pos', JSON.stringify(pos));
    }, [pos, isDragging]);

    const toggleListening = (e: React.MouseEvent) => {
        e.stopPropagation();
        // If we dragged, do NOT toggle listening
        if (hasMoved.current) return;
        
        if (!isSupported) return;

        if (status === 'idle') {
            try { window.speechSynthesis.cancel(); recognitionRef.current?.start(); } catch (e) {}
        } else if (status === 'speaking') {
            window.speechSynthesis.cancel();
            setStatus('idle');
        } else {
            recognitionRef.current?.stop();
            setStatus('idle');
        }
    };

    if (!isSupported) return null;

    return (
        <div 
            className="fixed z-[9999] transition-all duration-75"
            style={{ 
                top: `${pos.top}px`, 
                left: `${pos.left}px`, 
                cursor: isDragging ? 'grabbing' : 'grab', 
                touchAction: 'none' 
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="relative">
                {/* AI Dialogue Bubble - Absolute positioned to grow UPWARDS */}
                {(status !== 'idle') && (
                    <div className="absolute bottom-full right-0 mb-4 w-max max-w-[280px] animate-pop origin-bottom-right pointer-events-none">
                        <div className="bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl p-5 rounded-2xl rounded-br-none text-white">
                            <div className="relative z-10">
                                {status === 'listening' && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1 h-4 items-center">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s`, height: '100%' }}></div>
                                            ))}
                                        </div>
                                        <span className="font-medium text-sm text-slate-200">Listening...</span>
                                    </div>
                                )}
                                
                                {status === 'thinking' && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-300 font-medium italic text-sm">"{transcript}"</p>
                                        <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mt-1">
                                            <Loader2 size={12} className="animate-spin" /> Processing
                                        </div>
                                    </div>
                                )}

                                {status === 'speaking' && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
                                                <BrainCircuit size={12} /> FocusMind AI
                                            </div>
                                            <Activity size={12} className="text-green-400 animate-pulse" />
                                        </div>
                                        <p className="text-white text-sm leading-relaxed font-light">{aiResponse}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Orb Button */}
                <div className="relative group">
                    {/* Pulsing Rings */}
                    {status === 'listening' && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping"></div>
                            <div className="absolute -inset-4 rounded-full bg-purple-500/20 animate-pulse"></div>
                        </>
                    )}
                    
                    {/* Tooltip */}
                    {status === 'idle' && showTooltip && !isDragging && (
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 animate-slide-in-right bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-2 whitespace-nowrap">
                            <span>Try "Dark mode on"</span>
                            <button onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} className="hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-0.5 close-btn"><X size={12}/></button>
                        </div>
                    )}

                    <button
                        onClick={toggleListening}
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 overflow-hidden ${
                            status === 'listening' ? 'bg-slate-900 scale-110 ring-4 ring-brand-500/50' :
                            status === 'thinking' ? 'bg-slate-900 scale-105 ring-4 ring-purple-500/50' :
                            status === 'speaking' ? 'bg-slate-900 scale-105 ring-4 ring-green-500/50' :
                            'bg-gradient-to-br from-brand-600 to-purple-600 hover:scale-110 hover:shadow-brand-500/40'
                        }`}
                    >
                        {/* Inner Gradient Animation */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${status === 'idle' ? 'group-hover:animate-shimmer' : ''}`}></div>

                        <div className={`relative z-10 transition-all duration-300 ${status !== 'idle' ? 'text-white' : 'text-white'}`}>
                            {status === 'listening' ? <Mic size={28} className="animate-bounce-subtle" /> :
                            status === 'thinking' ? <Loader2 size={28} className="animate-spin" /> :
                            status === 'speaking' ? <Volume2 size={28} className="animate-pulse" /> :
                            <Mic size={28} />
                            }
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};