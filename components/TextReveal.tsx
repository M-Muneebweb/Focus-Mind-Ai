import React from 'react';

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className = "", delay = 0 }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      {text.split(" ").map((word: string, i: number) => (
        <span 
          key={i} 
          className="inline-block animate-slide-up opacity-0 fill-mode-forwards"
          style={{ animationDelay: `${delay + i * 80}ms` }}
        >
          {word}&nbsp;
        </span>
      ))}
    </div>
  );
};