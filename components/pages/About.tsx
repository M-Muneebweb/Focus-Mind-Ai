import React from 'react';
import { Target, Zap } from 'lucide-react';
import { ScrollReveal } from '../ScrollReveal';

export const AboutPage = ({ onNavigate }: any) => (
    <div className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-24">
                <h1 className="text-5xl md:text-7xl font-black font-display text-slate-900 dark:text-white mb-8 tracking-tight">Our Mission</h1>
                <p className="text-2xl text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    We believe that knowledge should be accessible, understandable, and retainable for everyone. 
                    FocusMind AI bridges the gap between raw information and true understanding.
                </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                <ScrollReveal delay={100} direction="left">
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 h-full">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                            <Target size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Problem</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            Students and professionals are drowning in information. Textbooks, whitepapers, and reports are dense and time-consuming. Traditional study methods are passive and inefficient.
                        </p>
                    </div>
                </ScrollReveal>
                
                <ScrollReveal delay={200} direction="right">
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 h-full">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Solution</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            FocusMind uses state-of-the-art Generative AI to actively process content. We turn static text into dynamic Mind Maps and Quizzes, forcing active recall and deepening comprehension.
                        </p>
                    </div>
                </ScrollReveal>
            </div>

            <ScrollReveal delay={300} className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">Meet the Developer</h2>
                <div className="inline-flex items-center gap-6 bg-white dark:bg-slate-800 p-6 pr-12 rounded-full border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group" onClick={() => window.open('https://muhammad-muneeb-developer.vercel.app', '_blank')}>
                    <div className="w-20 h-20 bg-slate-200 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-700 group-hover:ring-brand-500 transition-all">
                        <img src="https://avatars.githubusercontent.com/u/109923057?v=4" alt="Muhammad Muneeb" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">Muhammad Muneeb</div>
                        <div className="text-brand-600 font-medium">Full Stack Developer</div>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    </div>
);