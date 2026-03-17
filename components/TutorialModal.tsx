import React, { useState } from 'react';
import {
    X, ChevronRight, ChevronLeft, Sparkles,
    FileUp, Share2, Brain, HelpCircle,
    MessageSquare, CheckCircle2, Rocket
} from 'lucide-react';

interface TutorialModalProps {
    onClose: () => void;
}

const steps = [
    {
        title: "Welcome to FocusMind AI",
        description: "Transform your study materials into powerful learning tools. This tutorial will show you how to master your subjects in minutes.",
        icon: <Rocket className="text-brand-600" size={48} />,
        color: "bg-brand-100 dark:bg-brand-900/30"
    },
    {
        title: "Upload & Analyze",
        description: "Start by uploading PDFs, images, or pasting text. Our AI will automatically summarize and extract key concepts for you.",
        icon: <FileUp className="text-blue-600" size={48} />,
        color: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
        title: "Visual Mind Maps",
        description: "Visualize complex topics instantly. Click 'Generate Mind Map' to see how concepts connect in an interactive diagram.",
        icon: <Share2 className="text-orange-600" size={48} />,
        color: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
        title: "Active Recall Tools",
        description: "Generate Flashcards and Quizzes with one click. Test yourself to ensure you've truly mastered the material.",
        icon: <Brain className="text-purple-600" size={48} />,
        color: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
        title: "AI Study Assistant",
        description: "Have a specific question? Ask our AI Chat anything about your document. It's like having a private tutor 24/7.",
        icon: <MessageSquare className="text-green-600" size={48} />,
        color: "bg-green-100 dark:bg-green-900/30"
    }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 animate-pop">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all z-10"
                >
                    <X size={24} />
                </button>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-1 pt-1">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-full flex-grow rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                        />
                    ))}
                </div>

                <div className="p-10 pt-16">
                    {/* Icon Section */}
                    <div className={`w-24 h-24 ${steps[currentStep].color} rounded-3xl flex items-center justify-center mb-8 mx-auto animate-bounce-subtle`}>
                        {steps[currentStep].icon}
                    </div>

                    {/* Text Section */}
                    <div className="text-center mb-10 min-h-[140px]">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                            {steps[currentStep].title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                            {steps[currentStep].description}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${currentStep === 0
                                    ? 'opacity-0 pointer-events-none'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <ChevronLeft size={20} />
                            Back
                        </button>

                        <button
                            onClick={nextStep}
                            className="flex-grow md:flex-initial flex items-center justify-center gap-2 px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-glow hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>Get Started <Rocket size={20} /></>
                            ) : (
                                <>Next <ChevronRight size={20} /></>
                            )}
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div className="text-center mt-8">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
