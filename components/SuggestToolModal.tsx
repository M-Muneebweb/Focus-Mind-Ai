import React, { useState } from 'react';
import { X, Send, Sparkles, MessageSquare, Loader2 } from 'lucide-react';

interface SuggestToolModalProps {
    onClose: () => void;
    userEmail?: string;
    userName?: string;
}

export const SuggestToolModal: React.FC<SuggestToolModalProps> = ({ onClose, userEmail = '', userName = '' }) => {
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);
    const [suggestion, setSuggestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/suggest-tool', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, suggestion })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert('Failed to send suggestion. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-pop">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>

                {submitted ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Awesome!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                            Your suggestion has been sent to our founders. We love hearing from our power users!
                        </p>
                        <button onClick={onClose} className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-glow hover:bg-brand-700 transition-all">
                            Back to Study
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-2xl flex items-center justify-center">
                                <MessageSquare size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Suggest a Feature</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">What would make FocusMind better for you?</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Suggestion</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={suggestion}
                                    onChange={e => setSuggestion(e.target.value)}
                                    className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all resize-none"
                                    placeholder="I wish I could generate..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-glow hover:bg-brand-700 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                            >
                                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                Send Suggestion
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
