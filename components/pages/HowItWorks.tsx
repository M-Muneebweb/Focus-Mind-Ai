import React from 'react';
import { UploadCloud, BrainCircuit, Lightbulb, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '../ScrollReveal';

export const HowItWorksPage = ({ onNavigate }: any) => {
  const steps = [
    {
      icon: <UploadCloud size={32} />,
      title: "1. Upload Your Material",
      desc: "Simply drag & drop your PDF lecture slides, textbooks, or paste your raw notes directly into the app. We support files up to 50MB.",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
    },
    {
      icon: <BrainCircuit size={32} />,
      title: "2. AI Analysis",
      desc: "Our advanced AI models analyze the text, identifying key concepts, hierarchies, and relationships within seconds.",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
    },
    {
      icon: <Lightbulb size={32} />,
      title: "3. Choose Your Tool",
      desc: "Instantly generate Mind Maps to visualize connections, Flashcards for active recall, or Quizzes to test your knowledge.",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
    }
  ];

  return (
    <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-24">
                <h1 className="text-5xl md:text-7xl font-black font-display text-slate-900 dark:text-white mb-8 tracking-tight">How It Works</h1>
                <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                    From raw document to mastered subject in three simple steps.
                </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative mb-32">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-amber-200 dark:from-blue-900 dark:via-purple-900 dark:to-amber-900 -z-10"></div>

                {steps.map((step, i) => (
                    <ScrollReveal key={i} delay={i * 200} className="relative">
                        <div className={`w-24 h-24 mx-auto ${step.color} rounded-3xl flex items-center justify-center mb-8 shadow-lg z-10 relative`}>
                            {step.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">{step.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed text-lg px-4">
                            {step.desc}
                        </p>
                    </ScrollReveal>
                ))}
            </div>

            <ScrollReveal delay={400} className="bg-slate-900 dark:bg-black rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 relative z-10">Ready to boost your grades?</h2>
                <button 
                    onClick={() => onNavigate('app')}
                    className="px-10 py-5 bg-white text-slate-900 text-xl font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 shadow-2xl relative z-10"
                >
                    Get Started Free <ArrowRight size={20} />
                </button>
            </ScrollReveal>
        </div>
    </div>
  );
};