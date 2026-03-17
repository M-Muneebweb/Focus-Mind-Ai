import React from 'react';
import { KeyConcept } from '../types';
import { BookOpen, Tag, Lightbulb } from 'lucide-react';

interface KeyConceptsProps {
  concepts: KeyConcept[];
  onRegenerate: () => void;
}

export const KeyConcepts: React.FC<KeyConceptsProps> = ({ concepts, onRegenerate }) => {
  if (concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 animate-fade-in">
         <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4 animate-float">
            <BookOpen size={48} className="text-slate-400" />
         </div>
         <p className="text-lg font-medium mb-2">No concepts extracted yet</p>
         <button onClick={onRegenerate} className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95">
            Extract Key Concepts
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 animate-slide-up">
            <div>
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-3">
                <Lightbulb className="text-yellow-500" size={32} /> Key Concepts
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Glossary of important terms and definitions</p>
            </div>
            
            <button 
                onClick={onRegenerate}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
            >
                Refresh
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concepts.map((concept, idx) => (
                <div 
                    key={concept.id || idx} 
                    className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up flex flex-col hover:border-brand-200 dark:hover:border-brand-900"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300 text-[10px] uppercase font-bold tracking-wider rounded-md flex items-center gap-1 group-hover:bg-brand-100 transition-colors">
                            <Tag size={10} /> {concept.category || "General"}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 transition-colors">
                        {concept.term}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-grow">
                        {concept.definition}
                    </p>
                </div>
            ))}
        </div>
    </div>
  );
};