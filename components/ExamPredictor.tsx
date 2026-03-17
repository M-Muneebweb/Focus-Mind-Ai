import React from 'react';
import { AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

interface Prediction {
    question: string;
    weight: number;
    tip: string;
}

interface ExamPredictorProps {
    predictions: Prediction[];
}

export const ExamPredictor: React.FC<ExamPredictorProps> = ({ predictions }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {predictions.map((p, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors group">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                                    {p.question}
                                </h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${p.weight >= 8 ? 'bg-rose-100 text-rose-600' :
                                    p.weight >= 5 ? 'bg-amber-100 text-amber-600' :
                                        'bg-emerald-100 text-emerald-600'
                                }`}>
                                Priority: {p.weight}/10
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <Lightbulb className="text-amber-500 shrink-0" size={18} />
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                <span className="font-bold not-italic">Study Tip:</span> {p.tip}
                            </p>
                        </div>
                    </div>
                ))}
                {predictions.length === 0 && (
                    <div className="text-center py-12">
                        <AlertTriangle className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500">No predictions available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
