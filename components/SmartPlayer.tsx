import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Headphones } from 'lucide-react';

interface SmartPlayerProps {
    text: string;
    onClose: () => void;
}

export const SmartPlayer: React.FC<SmartPlayerProps> = ({ text, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Store chunks of text
    const chunksRef = useRef<string[]>([]);
    
    // Keep track if we should be playing (used in async loops)
    const activeRef = useRef(false);

    useEffect(() => {
        // Prepare text by cleaning and splitting into sentence-like chunks
        // Matches sentences ending with . ! ? or newlines
        const cleanText = text.replace(/[*#_]/g, ' ').replace(/\s+/g, ' ').trim();
        const sentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
        chunksRef.current = sentences.map(s => s.trim()).filter(s => s.length > 0);
        setCurrentIndex(0);
        setProgress(0);

        // Cleanup on unmount
        return () => {
            stop();
        };
    }, [text]);

    const speakChunk = (index: number) => {
        if (index >= chunksRef.current.length || !activeRef.current) {
            if (index >= chunksRef.current.length) {
                setIsPlaying(false);
                setProgress(100);
                activeRef.current = false;
            }
            return;
        }

        setCurrentIndex(index);
        // Calculate progress based on chunk index
        const p = (index / chunksRef.current.length) * 100;
        setProgress(p);

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(chunksRef.current[index]);
        utterance.rate = 1.0;
        utterance.onend = () => {
            if (activeRef.current) {
                speakChunk(index + 1);
            }
        };
        utterance.onerror = () => {
            // If error, try moving next
            if (activeRef.current) {
                speakChunk(index + 1);
            }
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const togglePlay = () => {
        if (isPlaying) {
            // Pause
            activeRef.current = false;
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            // Play
            activeRef.current = true;
            setIsPlaying(true);
            speakChunk(currentIndex);
        }
    };

    const stop = () => {
        activeRef.current = false;
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentIndex(0);
        setProgress(0);
    };

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 z-40 animate-slide-up shadow-2xl">
            <div className="max-w-3xl mx-auto flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                    <Headphones size={24} />
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">AI Audio Summary</span>
                        <span className="text-xs text-slate-500 font-mono">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-brand-600 transition-all duration-300 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={togglePlay}
                        className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-transform active:scale-95 shadow-lg shadow-brand-500/20"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>
                    <button 
                        onClick={() => { stop(); onClose(); }}
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <Square size={18} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
};