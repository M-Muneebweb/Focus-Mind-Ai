import React from 'react';
import { Lightbulb, Sparkles, AlertCircle } from 'lucide-react';

export const Mnemonics = ({ mnemonics, onRegenerate }: { mnemonics: any[], onRegenerate: () => void }) => {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white flex items-center gap-3">
                        <Sparkles className="text-brand-500" size={32} />
                        Memory Aids
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Clever mnemonics to help you remember key concepts.</p>
                </div>
                <button onClick={onRegenerate} className="px-5 py-2.5 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl font-bold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors flex items-center gap-2">
                    <Sparkles size={18} /> Regenerate
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mnemonics.map((m: any, i: number) => (
                    <div key={m.id || i} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center shrink-0">
                                <Lightbulb size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{m.term}</h3>
                                <p className="text-lg text-brand-600 dark:text-brand-400 font-medium mb-3">"{m.mnemonic}"</p>
                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                        <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                        {m.explanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
