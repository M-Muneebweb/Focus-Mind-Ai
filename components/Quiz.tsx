import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, HelpCircle, RefreshCw, Eye, Trophy, ArrowRight, Volume2, VolumeX, RotateCcw } from 'lucide-react';

// Declare confetti global
declare const confetti: any;

interface QuizProps {
    questions: Question[];
    onRegenerate: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ questions, onRegenerate }) => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Audio Refs
    const correctAudio = useRef<HTMLAudioElement | null>(null);
    const wrongAudio = useRef<HTMLAudioElement | null>(null);
    const winAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        correctAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        wrongAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
        winAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'); // Fanfare
    }, []);

    const playSound = (type: 'correct' | 'wrong' | 'win') => {
        if (!soundEnabled) return;
        if (type === 'correct' && correctAudio.current) {
            correctAudio.current.currentTime = 0;
            correctAudio.current.play();
        } else if (type === 'wrong' && wrongAudio.current) {
            wrongAudio.current.currentTime = 0;
            wrongAudio.current.play();
        } else if (type === 'win' && winAudio.current) {
            winAudio.current.currentTime = 0;
            winAudio.current.play();
        }
    };

    const handleSelect = (qId: string, optionIndex: number) => {
        if (showResults) return;

        // Check instant feedback
        const question = questions.find(q => q.id === qId);
        if (question) {
            if (question.correctIndex === optionIndex) {
                playSound('correct');
            } else {
                playSound('wrong');
            }
        }

        setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    };

    const toggleReveal = (qId: string) => {
        setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const resetQuiz = () => {
        setAnswers({});
        setShowResults(false);
        setRevealedAnswers({});
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctIndex) score++;
        });
        return score;
    };

    // Trigger Confetti on high score
    useEffect(() => {
        if (showResults) {
            const score = calculateScore();
            const percentage = score / questions.length;
            if (percentage >= 0.8) {
                playSound('win');
                if (typeof confetti !== 'undefined') {
                    const duration = 3000;
                    const end = Date.now() + duration;

                    (function frame() {
                        confetti({
                            particleCount: 5,
                            angle: 60,
                            spread: 55,
                            origin: { x: 0 },
                            colors: ['#2563eb', '#1d4ed8', '#60a5fa']
                        });
                        confetti({
                            particleCount: 5,
                            angle: 120,
                            spread: 55,
                            origin: { x: 1 },
                            colors: ['#2563eb', '#1d4ed8', '#60a5fa']
                        });

                        if (Date.now() < end) {
                            requestAnimationFrame(frame);
                        }
                    }());
                }
            }
        }
    }, [showResults]);

    const getScoreColor = (score: number, total: number) => {
        const percentage = score / total;
        if (percentage >= 0.8) return 'text-green-500';
        if (percentage >= 0.5) return 'text-orange-500';
        return 'text-red-500';
    };

    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 animate-fade-in">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4 animate-float">
                    <HelpCircle size={48} className="text-slate-400" />
                </div>
                <p className="text-lg font-medium mb-2">No quiz generated yet</p>
                <button onClick={onRegenerate} className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95">
                    Generate Quiz
                </button>
            </div>
        );
    }

    // Result Dashboard View
    if (showResults) {
        const score = calculateScore();
        const total = questions.length;
        const percentage = Math.round((score / total) * 100);

        return (
            <div className="max-w-3xl mx-auto p-8 h-full overflow-y-auto animate-fade-in">
                <div className="glass-card rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700 text-center mb-8 animate-pop relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent dark:from-brand-900/10 pointer-events-none"></div>

                    <div className="inline-flex p-5 rounded-full bg-brand-50 dark:bg-brand-900/20 mb-4 animate-bounce relative z-10">
                        <Trophy size={56} className="text-brand-500" />
                    </div>
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2 relative z-10">Quiz Complete!</h2>
                    <p className="text-slate-500 mb-6 relative z-10">Here is how you performed</p>

                    <div className="flex justify-center gap-8 mb-8 relative z-10">
                        <div className="text-center">
                            <div className={`text-5xl font-black ${getScoreColor(score, total)}`}>{percentage}%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Accuracy</div>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="text-center">
                            <div className="text-5xl font-black text-slate-800 dark:text-white">{score}/{total}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Score</div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 relative z-10">
                        <button
                            onClick={resetQuiz}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all hover:scale-105 active:scale-95"
                        >
                            <RefreshCw size={18} /> Retry Quiz
                        </button>
                        <button
                            onClick={onRegenerate}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            New Questions <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 px-2">Detailed Review</h3>
                <div className="space-y-4">
                    {questions.map((q, idx) => {
                        const isCorrect = answers[q.id] === q.correctIndex;
                        return (
                            <div key={q.id} className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] animate-slide-up ${isCorrect ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900' : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900'}`} style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="flex gap-3">
                                    <div className={`mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                        {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white mb-2">{q.question}</p>
                                        <div className="text-sm text-slate-600 dark:text-slate-300">
                                            <p><span className="font-bold">Your Answer:</span> {q.options?.[answers[q.id]] || 'Skipped'}</p>
                                            {!isCorrect && <p className="text-green-600 dark:text-green-400 mt-1"><span className="font-bold">Correct Answer:</span> {q.options?.[q.correctIndex]}</p>}
                                        </div>
                                        <div className="mt-3 text-sm text-slate-500 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                            <span className="font-bold">Explanation:</span> {q.explanation}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    // Active Quiz View
    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 overflow-y-auto h-full pb-24 scroll-smooth">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 animate-slide-up">
                <div>
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Practice Quiz</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Select the best answer for each question</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={resetQuiz}
                        className="p-3 rounded-xl transition-colors text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Reset Quiz"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-3 rounded-xl transition-colors ${soundEnabled ? 'bg-slate-100 dark:bg-slate-800 text-brand-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Toggle Sound"
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button
                        onClick={() => setShowResults(true)}
                        disabled={Object.keys(answers).length < questions.length}
                        className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${Object.keys(answers).length < questions.length
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20 hover:scale-105 active:scale-95'
                            }`}
                    >
                        Submit Quiz
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, idx) => {
                    // Stagger animation based on index
                    return (
                        <div key={q.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-500 ease-out-expo hover:shadow-soft-xl hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-bold mr-3 align-middle shadow-sm">
                                        {idx + 1}
                                    </span>
                                    {q.question}
                                </h3>
                                <button
                                    onClick={() => toggleReveal(q.id)}
                                    className="text-slate-400 hover:text-brand-500 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                    title="Peek Answer"
                                >
                                    <Eye size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 pl-0 md:pl-11">
                                {q.options?.map((opt, i) => {
                                    const isSelected = answers[q.id] === i;
                                    const isCorrect = q.correctIndex === i;
                                    const isRevealed = revealedAnswers[q.id] && isCorrect;

                                    let containerClass = "p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ease-out flex items-center justify-between group relative overflow-hidden ";

                                    if (isSelected) containerClass += "bg-brand-50 border-brand-500 text-brand-900 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-100 shadow-md transform scale-[1.01]";
                                    else if (isRevealed) containerClass += "bg-green-50 border-green-400 border-dashed text-green-800 dark:bg-green-900/10 dark:text-green-200";
                                    else containerClass += "border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:pl-5";

                                    return (
                                        <div
                                            key={i}
                                            className={containerClass}
                                            onClick={() => handleSelect(q.id, i)}
                                        >
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-brand-500 bg-brand-500 scale-110' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <span className="font-medium">{opt}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {revealedAnswers[q.id] && (
                                <div className="mt-6 ml-0 md:ml-11 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl text-sm text-slate-700 dark:text-slate-300 animate-pop">
                                    <span className="font-bold text-slate-900 dark:text-white block mb-1 flex items-center gap-2">
                                        <div className="p-1 bg-yellow-100 rounded text-yellow-600"><HelpCircle size={14} /></div>
                                        Explanation:
                                    </span>
                                    {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};