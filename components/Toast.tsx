import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

interface ToastProps {
    toasts: ToastMessage[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: ToastMessage, onClose: (id: string) => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        warning: <AlertTriangle size={20} className="text-orange-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const bgColors = {
        success: 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-900',
        error: 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-900',
        warning: 'bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-900',
        info: 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900'
    };

    return (
        <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border ${bgColors[toast.type]} animate-slide-up backdrop-blur-md`}>
            <div className="mt-0.5">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{toast.message}</p>
            <button onClick={() => onClose(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};