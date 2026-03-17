import React, { useState, useEffect, useMemo } from 'react';
import { Flashcard } from '../types';
import { ArrowLeft, ArrowRight, RotateCw, CheckCircle2, Circle, Filter, Volume2, Shuffle, Keyboard } from 'lucide-react';

interface FlashcardsProps {
  cards: Flashcard[];
  onRegenerate?: () => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ cards, onRegenerate }) => {
  // Initialize state with cards from props, adding status if missing
  const [localCards, setLocalCards] = useState<Flashcard[]>([]);
  const [showLearned, setShowLearned] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // initialize local cards with status
    setLocalCards(cards.map(c => ({ ...c, status: c.status || 'learning' })));
  }, [cards]);

  // Memoize activeCards to prevent stale closures and unnecessary recalcs
  const activeCards = useMemo(() => {
    return showLearned
      ? localCards
      : localCards.filter(c => c.status === 'learning');
  }, [showLearned, localCards]);

  const progress = Math.round((localCards.filter(c => c.status === 'learned').length / localCards.length) * 100) || 0;

  // Handler functions defined with useCallback to be used in effect
  const handleNext = () => {
    window.speechSynthesis.cancel();
    setIsFlipped(false);
    setTimeout(() => {
      // Use function update to ensure we use latest if called quickly
      setCurrentIndex((prev) => (prev + 1) % activeCards.length);
    }, 300);
  };

  const handlePrev = () => {
    window.speechSynthesis.cancel();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
    }, 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea')) return;

      if (activeCards.length === 0) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePrev();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
      }
    };

    // Add event listener to window to ensure it captures global key presses
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeCards, showLearned]); // Dependencies ensure fresh closures

  const handleShuffle = () => {
    const shuffled = [...localCards].sort(() => Math.random() - 0.5);
    setLocalCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleStatus = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeCards.length === 0) return;

    const currentCard = activeCards[currentIndex];
    const newStatus = currentCard.status === 'learned' ? 'learning' : 'learned';

    setLocalCards(prev => prev.map(c => c.id === currentCard.id ? { ...c, status: newStatus } : c));
  };

  const speakText = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  };

  if (activeCards.length === 0 && localCards.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in pb-24">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
        <p className="text-slate-500 mb-8">You've marked all cards as learned.</p>
        <button
          onClick={() => setShowLearned(true)}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl font-medium hover:scale-105 active:scale-95 transition-transform"
        >
          Review All Cards
        </button>
      </div>
    );
  }

  if (localCards.length === 0) return <div className="p-8 text-center text-slate-500">Generating flashcards...</div>;

  const currentCard = activeCards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 w-full max-w-4xl mx-auto pb-24 md:pb-8 outline-none" tabIndex={0}>
      {/* Header Stats */}
      <div className="w-full flex justify-between items-end mb-6 px-2 animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Flashcards</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span className="font-medium text-brand-600 dark:text-brand-400">{currentIndex + 1}</span> of <span className="font-medium">{activeCards.length}</span>
            {!showLearned && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">LEARNING MODE</span>}
            {onRegenerate && (
              <button
                onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                className="ml-2 text-xs font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 flex items-center gap-1"
              >
                <RotateCw size={10} /> Regenerate
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Mastery</div>
          <div className="w-24 md:w-32 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out shadow-lg" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Card Area - Responsive Sizing */}
      <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-[3/2] perspective-1000 group animate-scale-up delay-100">
        <div
          className={`relative w-full h-full duration-700 preserve-3d cursor-pointer transition-transform ease-out-cubic ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-6 md:p-12 text-center hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-2xl">
            <span className="absolute top-6 left-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm">Question</span>

            <button
              onClick={(e) => speakText(e, currentCard.front)}
              className="absolute top-6 right-16 p-3 md:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10 text-slate-400 hover:text-brand-500"
              title="Listen"
            >
              <Volume2 size={24} className={isSpeaking && !isFlipped ? "animate-pulse text-brand-500" : ""} />
            </button>

            <button
              onClick={toggleStatus}
              className="absolute top-6 right-6 p-3 md:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
              title={currentCard.status === 'learned' ? "Mark as Learning" : "Mark as Learned"}
            >
              {currentCard.status === 'learned' ?
                <CheckCircle2 size={24} className="text-green-500 animate-pop" /> :
                <Circle size={24} className="text-slate-300" />
              }
            </button>

            <p className="text-xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-snug select-none overflow-y-auto max-h-[70%] px-2 scrollbar-thin">
              {currentCard.front}
            </p>

            <div className="absolute bottom-6 text-sm text-slate-400 flex items-center gap-2 animate-pulse">
              <RotateCw size={14} /> Tap or Space to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-brand-50 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-brand-200 dark:border-brand-900 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-6 md:p-12 text-center">
            <span className="absolute top-6 left-6 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-100 dark:bg-brand-900/30 px-3 py-1 rounded-full shadow-sm">Answer</span>

            <button
              onClick={(e) => speakText(e, currentCard.back)}
              className="absolute top-6 right-6 p-3 md:p-2 rounded-full hover:bg-brand-100 dark:hover:bg-slate-700 transition-colors z-10 text-brand-400 hover:text-brand-600"
              title="Listen"
            >
              <Volume2 size={24} className={isSpeaking && isFlipped ? "animate-pulse text-brand-600" : ""} />
            </button>

            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-relaxed overflow-y-auto max-h-[70%] px-2 scrollbar-thin select-none">
              {currentCard.back}
            </p>

            {/* Actions on back */}
            <div className="absolute bottom-6 flex gap-3 z-20">
              <button
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setTimeout(() => toggleStatus(), 200); if (currentIndex < activeCards.length - 1) handleNext(); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 ${currentCard.status === 'learned' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {currentCard.status === 'learned' ? 'Reset to Learning' : 'Got it!'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full max-w-2xl mt-8 animate-slide-up delay-200">
        <div className="flex gap-2">
          <button
            onClick={() => setShowLearned(!showLearned)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!showLearned ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">{showLearned ? 'Review Difficult' : 'Show All'}</span>
          </button>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Shuffle Cards"
          >
            <Shuffle size={16} />
          </button>
        </div>

        {/* Help Tip - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
          <Keyboard size={12} /> Space to flip • Arrows to nav
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePrev}
            className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all hover:-translate-x-1 active:scale-95 touch-manipulation"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="p-4 rounded-full bg-brand-600 shadow-lg hover:shadow-xl hover:bg-brand-700 text-white transition-all hover:translate-x-1 active:scale-95 hover:shadow-brand-500/30 touch-manipulation"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};