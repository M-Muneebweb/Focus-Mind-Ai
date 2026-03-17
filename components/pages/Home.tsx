import React, { useRef, useState } from 'react';
import { ArrowRight, Sparkles, Network, Layers, FileQuestion, MessageSquare, Star, Check } from 'lucide-react';
import { ScrollReveal } from '../ScrollReveal';
import { TextReveal } from '../TextReveal';
import { SpotlightCard } from '../SpotlightCard';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../BrandLogo';

export const HomePage = ({ onNavigate, onOpenAuth }: any) => {
    const { user } = useAuth();
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [emailInput, setEmailInput] = useState('');

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dashboardRef.current) return;
        const rect = dashboardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 25;
        const y = (e.clientY - rect.top - rect.height / 2) / 25;
        setMousePos({ x, y });
    };

    const handleHeroSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onOpenAuth();
    };

    return (
        <div className="overflow-x-hidden w-full">
            {/* Hero Section */}
            <section
                className="relative pt-32 pb-48 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center"
                onMouseMove={handleMouseMove}
            >
                {/* Animated Background */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] dark:opacity-[0.2]"></div>

                    {/* Dynamic Aurora Blobs */}
                    <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-300/30 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
                    <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-brand-300/30 dark:bg-brand-900/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-blue-300/30 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">

                    <div className="mb-8">
                        <TextReveal
                            text="Study Smarter,"
                            className="text-6xl md:text-8xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight pb-2 drop-shadow-sm max-w-5xl justify-center flex flex-wrap"
                            delay={100}
                        />
                        <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight leading-tight drop-shadow-sm max-w-5xl animate-slide-up opacity-0 fill-mode-forwards pb-4" style={{ animationDelay: '500ms' }}>
                            <span className="text-transparent bg-clip-text animate-gradient-text bg-gradient-to-r from-brand-600 via-purple-500 to-brand-600 bg-[length:200%_auto]">Not Harder.</span>
                        </h1>
                    </div>

                    <ScrollReveal delay={600}>
                        <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed px-4 font-light">
                            FocusMind transforms your documents into interactive <span className="text-slate-900 dark:text-white font-semibold decoration-brand-400/50 underline-offset-4 decoration-2 underline">Mind Maps</span>, <span className="text-slate-900 dark:text-white font-semibold decoration-purple-400/50 underline-offset-4 decoration-2 underline">Quizzes</span>, and <span className="text-slate-900 dark:text-white font-semibold decoration-blue-400/50 underline-offset-4 decoration-2 underline">Flashcards</span> in seconds.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={700} className="w-full flex justify-center mb-24">
                        {user ? (
                            <button
                                onClick={() => onNavigate('app')}
                                className="px-12 py-5 bg-brand-600 hover:bg-brand-500 text-white text-xl font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(139,92,246,0.5)] hover:shadow-[0_25px_50px_-15px_rgba(139,92,246,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <span className="relative z-10">Go to Dashboard</span>
                                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-in-out"></div>
                            </button>
                        ) : (
                            <div className="w-full max-w-lg">
                                <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row gap-3 p-2 bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl hover:border-brand-500/50 transition-colors group focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/20">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address..."
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        className="flex-1 bg-transparent px-4 py-3 text-lg outline-none text-slate-900 dark:text-white placeholder-slate-400"
                                    />
                                    <button type="submit" className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap flex items-center justify-center gap-2">
                                        Get Started <ArrowRight size={18} />
                                    </button>
                                </form>
                                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    <span className="text-green-500">●</span> Free 10 Daily generations. No credit card required.
                                </p>
                            </div>
                        )}
                    </ScrollReveal>

                    {/* 3D Dashboard Visual - Mouse Parallax */}
                    <ScrollReveal delay={100} className="w-full">
                        <div
                            ref={dashboardRef}
                            className="w-full max-w-6xl mx-auto perspective-1000 relative group px-2 md:px-0"
                        >
                            <div
                                className="relative transition-transform duration-100 ease-out preserve-3d shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
                                style={{ transform: `rotateX(${10 - mousePos.y}deg) rotateY(${mousePos.x}deg)` }}
                            >
                                <div className="bg-gradient-to-tr from-brand-500/10 to-purple-500/10 absolute -inset-4 rounded-[3rem] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>

                                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9] backface-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
                                    {/* Mock Header */}
                                    <div className="h-10 md:h-14 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center px-4 md:px-6 gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                                        <div className="flex gap-1.5 md:gap-2">
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/80 shadow-sm"></div>
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/80 shadow-sm"></div>
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400/80 shadow-sm"></div>
                                        </div>
                                        <div className="ml-2 md:ml-4 h-2 w-32 md:w-64 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50"></div>
                                    </div>

                                    {/* Mock Content */}
                                    <div className="p-4 md:p-8 grid grid-cols-12 gap-4 md:gap-8 h-full bg-slate-50/50 dark:bg-black/20">
                                        <div className="col-span-3 space-y-4 hidden md:block">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-12 w-full bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center px-4 gap-3">
                                                    <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700/50"></div>
                                                    <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-span-12 md:col-span-9 grid grid-cols-2 gap-4 md:gap-6">
                                            <div className="col-span-2 h-24 md:h-40 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl md:rounded-2xl border border-blue-500/10 flex items-center justify-center relative overflow-hidden group/card">
                                                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                                                <Sparkles className="text-blue-500 animate-pulse-slow relative z-10 w-8 h-8 md:w-12 md:h-12" />
                                                <div className="absolute bottom-4 right-6 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 text-xs font-bold rounded-full hidden md:block border border-blue-200 dark:border-blue-800">Generate</div>
                                            </div>
                                            <div className="h-28 md:h-48 bg-white dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden shadow-sm flex items-center justify-center">
                                                <Network className="text-slate-200 dark:text-slate-700 w-12 h-12 md:w-16 md:h-16" />
                                            </div>
                                            <div className="h-28 md:h-48 bg-white dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden shadow-sm flex items-center justify-center">
                                                <div className="w-16 h-20 md:w-24 md:h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center">
                                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-4 border-emerald-500/30"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements - Parallax with depth */}
                                <div
                                    className="absolute -left-16 top-1/4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-glass border border-white/20 dark:border-white/5 hidden lg:block"
                                    style={{ transform: `translateZ(40px) translateX(${mousePos.x * 1.5}px) translateY(${mousePos.y * 1.5}px)` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 shadow-inner">
                                            <Check size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</div>
                                            <div className="font-bold text-slate-800 dark:text-white text-lg">Quiz Aced!</div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="absolute -right-12 bottom-1/3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-glass border border-white/20 dark:border-white/5 hidden lg:block"
                                    style={{ transform: `translateZ(60px) translateX(${mousePos.x * -2}px) translateY(${mousePos.y * -2}px)` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                            <Network size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated</div>
                                            <div className="font-bold text-slate-800 dark:text-white text-lg">Mind Map Ready</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Features Bento Grid Section */}
            <section className="py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white mb-6 tracking-tight">Powerful Features</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light">Everything you need to master your subjects in one place.</p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
                        {/* Mind Map - Large */}
                        <ScrollReveal delay={100} direction="left" className="md:col-span-2 h-full">
                            <SpotlightCard className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/20 dark:border-white/5 relative group hover:border-blue-500/30 hover:shadow-2xl transition-all duration-500">
                                <div className="relative z-10 h-full flex flex-col justify-between transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div>
                                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            <Network size={28} />
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Visual Mind Mapping</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md leading-relaxed">Turn complex PDFs into structured, easy-to-digest visual hierarchies instantly. Edit, expand, and export.</p>
                                    </div>
                                    <div className="absolute -right-20 -bottom-20 w-3/4 h-full opacity-30 group-hover:opacity-60 transition-opacity group-hover:scale-105 duration-700">
                                        <div className="w-full h-full border-t border-l border-blue-400/30 rounded-tl-[100px] relative">
                                            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                                            <div className="absolute top-10 left-10 w-3 h-3 bg-blue-400/50 rounded-full"></div>
                                            <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-400/50 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </ScrollReveal>

                        {/* Flashcards - Tall */}
                        <ScrollReveal delay={200} direction="up" className="md:row-span-2 h-full">
                            <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.15)" className="h-full bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 border border-slate-800 relative group hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-500">
                                <div className="relative z-10 h-full flex flex-col transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="w-14 h-14 bg-emerald-900/50 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:rotate-12 transition-transform">
                                        <Layers size={28} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Smart Flashcards</h3>
                                    <p className="text-slate-400 mb-8 text-lg leading-relaxed">Active recall made simple. Our AI generates questions that test deep understanding.</p>

                                    <div className="mt-auto relative h-64 w-full perspective-1000">
                                        <div className="absolute bottom-0 left-0 right-0 bg-slate-800 h-40 rounded-2xl border border-slate-700 transform translate-y-8 scale-90 opacity-40 group-hover:translate-y-10 transition-transform duration-500"></div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-slate-800 h-40 rounded-2xl border border-slate-700 transform translate-y-4 scale-95 opacity-70 group-hover:translate-y-5 transition-transform duration-500"></div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 h-40 rounded-2xl border border-emerald-500 text-white font-bold flex items-center justify-center text-xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-500">
                                            Active Recall
                                        </div>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </ScrollReveal>

                        {/* Quiz */}
                        <ScrollReveal delay={300} direction="up" className="h-full">
                            <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.15)" className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/20 dark:border-white/5 relative group hover:border-rose-500/30 hover:shadow-xl transition-all duration-500">
                                <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                        <FileQuestion size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">AI Quizzes</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">Test your knowledge with auto-generated multiple choice questions.</p>
                                </div>
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors"></div>
                            </SpotlightCard>
                        </ScrollReveal>

                        {/* Chat */}
                        <ScrollReveal delay={400} direction="right" className="h-full">
                            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)" className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/20 dark:border-white/5 relative group hover:border-brand-500/30 hover:shadow-xl transition-all duration-500">
                                <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                        <MessageSquare size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">24/7 AI Tutor</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">Ask specific questions about your document and get instant citations.</p>
                                </div>
                                <div className="absolute -left-8 -top-8 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors"></div>
                            </SpotlightCard>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Infinite Testimonials Section */}
            <section className="py-32 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 overflow-hidden relative">
                <ScrollReveal className="text-center mb-16 px-4">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">Loved by Students & Pros</h2>
                </ScrollReveal>

                <div className="relative w-full">
                    <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10"></div>

                    <div className="flex animate-marquee hover:[animation-play-state:paused] gap-8 w-max px-8">
                        {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                            <div key={i} className="w-[400px] bg-slate-50/50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex-shrink-0 hover:scale-[1.02] transition-transform duration-300 hover:border-brand-200 dark:hover:border-slate-700 shadow-sm hover:shadow-xl backdrop-blur-sm">
                                <div className="flex gap-1 text-amber-400 mb-6">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill="currentColor" />)}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed text-lg font-medium">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center font-bold text-brand-700 dark:text-brand-300 text-lg shadow-inner">
                                        {t.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-base">{t.author}</div>
                                        <div className="text-sm text-slate-500 font-medium">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 relative overflow-hidden group">
                <div className="absolute inset-0 bg-slate-900 dark:bg-black transition-colors duration-1000">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-900/40 to-purple-900/40 opacity-80 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.1]"></div>
                    {/* Glowing Orb */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-brand-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <ScrollReveal>
                        <h2 className="text-5xl md:text-7xl font-black font-display text-white mb-10 tracking-tight leading-tight">Ready to transform your grades?</h2>
                    </ScrollReveal>

                    <ScrollReveal delay={100}>
                        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">Join thousands of students studying smarter with AI. No credit card required.</p>
                    </ScrollReveal>

                    <ScrollReveal delay={200}>
                        <button
                            onClick={() => onNavigate('app')}
                            className="px-12 py-6 bg-white text-brand-600 text-xl font-bold rounded-2xl shadow-2xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all animate-bounce-subtle relative overflow-hidden group/btn w-full sm:w-auto"
                        >
                            <span className="relative z-10">Launch App Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
};

const testimonials = [
    { quote: "FocusMind cut my study time in half. The mind maps are a game changer.", author: "Sarah Jenkins", role: "Law Student" },
    { quote: "I use it to summarize technical whitepapers for work. The accuracy is impressive.", author: "Michael Chen", role: "Software Engineer" },
    { quote: "The quiz generation feature is exactly what I needed for exam prep.", author: "Emily R.", role: "Medical Student" },
    { quote: "Finally an AI tool that actually helps me understand, not just cheat.", author: "David K.", role: "History Major" },
    { quote: "The flashcards algorithm is really effective for memorization.", author: "Jessica T.", role: "Language Learner" },
];