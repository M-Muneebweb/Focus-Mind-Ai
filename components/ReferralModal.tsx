import React from 'react';
import { Zap, XCircle, ClipboardPaste, Sparkles } from 'lucide-react';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, user, addToast }) => {
    if (!isOpen) return null;

    const referralLink = `${window.location.origin}?ref=${user?.id || 'ID'}`;

    const handleCopy = () => {
        if (user) {
            navigator.clipboard.writeText(referralLink);
            addToast('success', 'Referral link copied!');
        }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-pop border border-slate-200 dark:border-slate-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <XCircle size={24} />
                </button>
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Zap size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white text-center">Refer & Earn Pro</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-center text-sm md:text-base">
                    Share this link with your friends. Once they sign up, you'll instantly receive <strong className="text-brand-600">7 Days of Free Pro</strong>!
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl mb-6 border border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest text-center">Your Invite Link</p>
                    <div className="flex flex-col gap-4">
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-inner">
                            {referralLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-lg"
                        >
                            <ClipboardPaste size={22} /> Copy Invite Link
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                    Done
                </button>
            </div>
        </div>
    );
};
