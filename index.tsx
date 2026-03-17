import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { RotateCcw, Activity } from 'lucide-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// Fix: Use Component directly and define state property
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly define props to avoid TS error "Property 'props' does not exist"
  public props: ErrorBoundaryProps;

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center font-sans">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 animate-pop">
             <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500 shadow-inner">
               <Activity size={40} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">System Halted</h1>
             <p className="text-slate-500 dark:text-slate-400 mb-8 text-base leading-relaxed">
               FocusMind encountered a critical error. This is usually caused by corrupted local data.
             </p>
             <div className="bg-slate-100 dark:bg-black/50 p-4 rounded-xl text-xs font-mono text-left mb-8 overflow-auto max-h-32 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
               {this.state.error?.message || "Unknown Error"}
             </div>
             <button 
               onClick={this.handleReset}
               className="w-full py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
             >
               <RotateCcw size={18} /> Reboot Application
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);