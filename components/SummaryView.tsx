import React from 'react';
import Markdown from 'react-markdown';
import { FileText, Copy, Check, Sparkles } from 'lucide-react';

interface SummaryViewProps {
  summary: string;
  tier: 'free' | 'pro';
  onRegenerate: (lang: string) => void;
  currentLanguage: string;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summary, tier, onRegenerate, currentLanguage }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-brand rounded-2xl shadow-lg shadow-brand-500/20 text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">Smart Summary</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">AI-synthesized revision notes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <select
            value={currentLanguage}
            onChange={(e) => onRegenerate(e.target.value)}
            disabled={tier !== 'pro'}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50"
          >
            <option value="English">English</option>
            {tier === 'pro' && (
              <>
                <option value="Urdu">Urdu</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Hindi">Hindi</option>
              </>
            )}
          </select>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 shadow-glass border border-white/20 dark:border-white/5 animate-slide-up [animation-delay:100ms]">
        <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <Markdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 mt-8 pb-2 border-b border-slate-200 dark:border-slate-700" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-brand-600 dark:text-brand-400 mb-4 mt-8 flex items-center gap-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-6" {...props} />,
              p: ({ node, ...props }) => <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-slate-600 dark:text-slate-300" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-slate-600 dark:text-slate-300" {...props} />,
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-brand-500 pl-4 py-1 my-4 italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg" {...props} />,
              code: ({ node, ...props }) => <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-sm font-mono text-brand-600 dark:text-brand-400" {...props} />,
            }}
          >
            {summary}
          </Markdown>
        </article>
      </div>
    </div>
  );
};