import React, { useState, useRef } from 'react';
import { X, Check, Zap, Upload, Loader2, Star, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EducationModal } from './EducationModal';

interface PricingModalProps {
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [showPayment, setShowPayment] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpgradeClick = () => {
        setShowPayment(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProof = async () => {
        if (!selectedImage) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/payment-proof', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: selectedImage,
                    userEmail: user?.email || 'Unknown User',
                    userId: user?.id
                })
            });

            if (res.ok) {
                setIsSuccess(true);
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`Failed to submit payment proof: ${data.error || 'Please try again.'}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up relative overflow-hidden max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10">
                    <X size={20} />
                </button>

                {isSuccess ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} />
                        </div>
                        <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-4">Proof Submitted!</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto">
                            Thank you! Your payment proof has been sent to our team. We will verify it and upgrade your account shortly. You will receive an email confirmation.
                        </p>
                        <button onClick={onClose} className="px-8 py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all">
                            Close
                        </button>
                    </div>
                ) : showPayment ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap size={32} />
                        </div>
                        <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-4">Upgrade to Pro</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-lg mx-auto">
                            Please send your payment of <strong>2500 Rs</strong> to the following EasyPaisa number:
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl inline-block mb-6 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider font-bold">EasyPaisa Account Number</p>
                            <p className="text-4xl font-mono font-bold text-brand-600 dark:text-brand-400 tracking-wider">03133258330</p>
                        </div>

                        <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upload Payment Proof</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Take a screenshot of your successful EasyPaisa transaction and upload it here.
                            </p>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />

                            {!selectedImage ? (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Upload size={24} />
                                    <span className="font-medium">Click to upload screenshot</span>
                                </button>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                    <img src={selectedImage} alt="Payment Proof" className="w-full h-48 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmitProof}
                            disabled={!selectedImage || isSubmitting}
                            className="px-8 py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto min-w-[250px]"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={20} className="animate-spin" /> Submitting...</>
                            ) : (
                                'Submit Payment Proof'
                            )}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Free Plan */}
                            <div className="p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">30 Months Free</p>
                                    <p className="text-[10px] text-brand-600 font-bold uppercase mt-1">Valid for 2 months only</p>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-green-500 shrink-0 mt-0.5" /> <span>10 AI Generations / Day</span></li>
                                        <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-green-500 shrink-0 mt-0.5" /> <span><strong>50,000</strong> Character Document Limit</span></li>
                                        <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-green-500 shrink-0 mt-0.5" /> <span>Basic AI Study Tools</span></li>
                                    </ul>
                                </div>
                                <button onClick={onClose} className="w-full py-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                    Current Plan
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className="p-8 rounded-[2rem] border border-brand-500/30 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-900 relative flex flex-col justify-between shadow-glow-sm">
                                <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">POPULAR</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Scholar</h3>
                                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-6 flex items-center justify-center gap-2"><span className="text-2xl text-slate-400 line-through">3000 Rs</span> 2500 Rs<span className="text-base font-medium text-slate-500">/mo</span></div>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start gap-3 text-slate-700 dark:text-slate-200 font-medium"><Check size={18} className="text-brand-500 shrink-0 mt-0.5" /> <span><strong>100</strong> AI Generations / Day</span></li>
                                        <li className="flex items-start gap-3 text-slate-700 dark:text-slate-200 font-medium"><Check size={18} className="text-brand-500 shrink-0 mt-0.5" /> <span><strong>100,000</strong> Character Limit</span></li>
                                        <li className="flex items-start gap-3 text-slate-700 dark:text-slate-200 font-medium"><Star size={18} className="text-amber-500 fill-amber-500 shrink-0 mt-0.5" /> <span><strong>Advanced Tools:</strong> Podcasts & more</span></li>
                                    </ul>
                                </div>
                                <button onClick={handleUpgradeClick} className="w-full py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
                                    <Zap size={18} fill="currentColor" /> Upgrade Now
                                </button>
                            </div>

                            {/* Education Plan */}
                            <div className="p-8 rounded-[2rem] border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Education</h3>
                                    <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-6">30 Mo<span className="text-base font-medium text-slate-500">/apply</span></div>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-blue-500 shrink-0 mt-0.5" /> <span>For Students & Teachers</span></li>
                                        <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-blue-500 shrink-0 mt-0.5" /> <span>Full Pro Features</span></li>
                                        <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-blue-500 shrink-0 mt-0.5" /> <span>Manual ID Verification</span></li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => setShowEducationModal(true)}
                                    className="w-full py-4 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <GraduationCap size={18} /> Apply for Plan
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <EducationModal
                    isOpen={showEducationModal}
                    onClose={() => setShowEducationModal(false)}
                />
            </div>
        </div>
    );
};