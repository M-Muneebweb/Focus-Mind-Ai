import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Github, Loader2, ArrowLeft } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [showForgot, setShowForgot] = useState(false);

    // Form States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState(() => localStorage.getItem('focusmind_referral_code') || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Sync referral code to localStorage so AuthContext can pick it up
    React.useEffect(() => {
        if (referralCode.trim()) {
            localStorage.setItem('focusmind_referral_code', referralCode.trim());
        } else {
            localStorage.removeItem('focusmind_referral_code');
        }
    }, [referralCode]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (showForgot) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setMessage('Check your email for the password reset link.');
            } else if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
            } else {
                // Sign Up Validation
                if (!agreedToTerms) {
                    throw new Error("You must agree to the Terms and Privacy Policy.");
                }
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;

                // Referral logic is now handled globally in AuthContext.tsx

                setMessage('Account created! Check your email for the confirmation link.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
    };

    const resetState = () => {
        setError('');
        setMessage('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[95vh] overflow-y-auto p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 animate-pop relative scrollbar-none">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10">
                    <X size={20} />
                </button>

                {/* Back button for Forgot Password */}
                {showForgot && (
                    <button onClick={() => { setShowForgot(false); resetState(); }} className="absolute top-4 left-4 text-slate-400 hover:text-brand-600 transition-colors z-10 flex items-center gap-1 text-sm font-bold">
                        <ArrowLeft size={16} /> Back
                    </button>
                )}

                <div className="mb-6">
                    <BrandLogo size="md" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 mt-2">
                    {showForgot ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                </h2>
                <p className="text-slate-500 mb-5 text-sm">
                    {showForgot
                        ? 'Enter your email to receive a reset link.'
                        : 'Sign in to access your tools.'}
                </p>

                {!showForgot && (
                    <>
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 mb-4"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Continue with Google
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span></div>
                        </div>
                    </>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Full Name for Sign Up */}
                    {!isLogin && !showForgot && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all text-sm"
                            placeholder="name@example.com"
                        />
                    </div>

                    {!showForgot && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Confirm Password for Sign Up */}
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className={`w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 transition-all dark:text-white text-sm ${confirmPassword && password !== confirmPassword ? 'focus:ring-red-500 border-red-500' : 'focus:ring-brand-500'}`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {!isLogin && !showForgot && (
                        <div className="flex items-start gap-3 py-2 animate-fade-in">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                checked={agreedToTerms}
                                onChange={e => setAgreedToTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-brand-600 rounded cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight cursor-pointer">
                                I agree to the <a href="#/terms" onClick={(e) => e.preventDefault()} className="text-brand-600 hover:underline">Terms of Service</a> and <a href="#/privacy" onClick={(e) => e.preventDefault()} className="text-brand-600 hover:underline">Privacy Policy</a>.
                            </label>
                        </div>
                    )}

                    {/* Forgot Password Link */}
                    {isLogin && !showForgot && (
                        <div className="flex justify-end">
                            <button type="button" onClick={() => { setShowForgot(true); resetState(); }} className="text-sm font-medium text-brand-600 hover:text-brand-500 hover:underline">
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}
                    {message && <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium">{message}</div>}

                    <button type="submit" disabled={loading} className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        {showForgot ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                {!showForgot && (
                    <p className="mt-6 text-center text-slate-500 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLogin(!isLogin); resetState(); }} className="text-brand-600 font-bold ml-1 hover:underline">
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};