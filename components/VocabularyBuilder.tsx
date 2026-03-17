import React from 'react';
import { Book, Volume2, Bookmark, CheckCircle } from 'lucide-react';

interface VocabWord {
    word: string;
    definition: string;
    example: string;
}

interface VocabularyBuilderProps {
    vocabulary: VocabWord[];
    onSaveToFlashcards: (word: string, definition: string) => void;
}

export const VocabularyBuilder: React.FC<VocabularyBuilderProps> = ({ vocabulary, onSaveToFlashcards }) => {
    const [savedWords, setSavedWords] = React.useState<Set<string>>(new Set());

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.cancel(); // kill any active speech
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSave = (word: string, definition: string) => {
        onSaveToFlashcards(word, definition);
        setSavedWords(prev => new Set(prev).add(word));
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vocabulary.map((v, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 font-display capitalize">
                                {v.word}
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => speak(`${v.word}. ${v.definition}`)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-brand-500"
                                    title="Listen to pronunciation and definition"
                                >
                                    <Volume2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleSave(v.word, v.definition)}
                                    disabled={savedWords.has(v.word)}
                                    className={`p-2 rounded-lg transition-colors ${savedWords.has(v.word) ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    title={savedWords.has(v.word) ? "Saved to Flashcards" : "Save to Flashcards"}
                                >
                                    {savedWords.has(v.word) ? <CheckCircle size={18} /> : <Bookmark size={18} />}
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed line-clamp-2 italic">
                            {v.definition}
                        </p>
                        <div className="bg-brand-50/50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100/50 dark:border-brand-800/20">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-1 block">Contextual Example</span>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                "{v.example}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {vocabulary.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Book className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">No vocabulary found in the document.</p>
                </div>
            )}
        </div>
    );
};
