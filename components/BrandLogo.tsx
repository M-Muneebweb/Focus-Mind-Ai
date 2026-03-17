import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface BrandLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = true, className = '' }) => {
    const iconSizes = {
        sm: 18,
        md: 22,
        lg: 28,
        xl: 40
    };

    const containerSizes = {
        sm: 'w-8 h-8 rounded-lg',
        md: 'w-10 h-10 rounded-xl',
        lg: 'w-14 h-14 rounded-2xl',
        xl: 'w-20 h-20 rounded-[2.5rem]'
    };

    const fontSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-3xl',
        xl: 'text-5xl'
    };

    return (
        <div className={`flex items-center gap-3 group transition-all duration-500 ${className}`}>
            <div className={`${containerSizes[size]} bg-brand-600 flex items-center justify-center text-white shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <BrainCircuit size={iconSizes[size]} />
            </div>
            {showText && (
                <span className={`font-bold ${fontSizes[size]} font-display tracking-tight text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors`}>
                    FocusMind<span className="text-brand-600"> AI</span>
                </span>
            )}
        </div>
    );
};
