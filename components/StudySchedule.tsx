import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';

export const StudySchedule = ({ schedule, onRegenerate }: { schedule: any[], onRegenerate: () => void }) => {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white flex items-center gap-3">
                        <Calendar className="text-brand-500" size={32} />
                        7-Day Study Plan
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Your step-by-step mastery plan.</p>
                </div>
                <button onClick={onRegenerate} className="px-5 py-2.5 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl font-bold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors flex items-center gap-2">
                    <Calendar size={18} /> Regenerate
                </button>
            </div>

            <div className="space-y-4">
                {schedule.map((s: any, i: number) => (
                    <div key={s.id || i} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center shrink-0 font-black text-xl">
                                {s.day}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{s.topic}</h3>
                        </div>
                        <ul className="space-y-3 pl-2">
                            {s.tasks?.map((task: string, tIndex: number) => (
                                <li key={tIndex} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 size={20} className="text-brand-500 shrink-0 mt-0.5" />
                                    <span>{task}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
