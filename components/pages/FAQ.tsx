import React from 'react';

export const FAQPage = () => (
  <div className="max-w-3xl mx-auto px-4 py-32 animate-fade-in">
    <h1 className="text-5xl font-bold font-display text-slate-900 dark:text-white mb-16 text-center tracking-tight">Frequently Asked Questions</h1>
    <div className="space-y-6" itemScope itemType="https://schema.org/FAQPage">
      {[
        { q: "How accurate is the AI?", a: "FocusMind uses advanced models to ensure high accuracy. However, we always recommend verifying critical information from the original document." },
        { q: "Is my data secure?", a: "Yes. Documents are processed in memory and are not stored permanently on our servers after the session ends." },
        { q: "Can I upload scanned PDFs?", a: "Currently, we support text-based PDFs. OCR for scanned documents is coming in the next update." },
        { q: "Is it completely free?", a: "Yes! We removed all pricing tiers. FocusMind is now free for students and educators." }
      ].map((item, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:border-brand-200 dark:hover:border-slate-600 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3" itemProp="name">{item.q}</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
             <p className="text-slate-600 dark:text-slate-400 leading-relaxed" itemProp="text">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);