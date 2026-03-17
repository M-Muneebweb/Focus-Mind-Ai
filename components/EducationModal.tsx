import React, { useState, useRef } from 'react';
import { X, GraduationCap, Upload, Loader2, CheckCircle, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EducationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EducationModal: React.FC<EducationModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [idImage, setIdImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form data
    const [formData, setFormData] = useState({
        institution: '',
        role: 'student',
        year: '',
    });

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setIdImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idImage) return;
        setLoading(true);

        try {
            const res = await fetch('/api/education-app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    image: idImage,
                    userEmail: user?.email || 'Unknown',
                    userId: user?.id
                })
            });

            if (res.ok) {
                setStep(3);
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`Submission failed: ${data.error || 'Please try again.'}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl animate-pop border border-slate-200 dark:border-slate-700 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={24} />
                </button>

                {step === 1 && (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <GraduationCap size={40} />
                        </div>
                        <h2 className="text-3xl font-black dark:text-white mb-2">Education Plan</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Limited Time Offer: Get 30 months of FocusMind Pro access. This offer is only available for the next 2 months!
                        </p>

                        <div className="grid grid-cols-1 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-left">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Requirements:</h4>
                                <ul className="text-sm text-slate-500 space-y-1">
                                    <li>• Valid Student or Teacher ID Card</li>
                                    <li>• Active enrollment in University/College/School</li>
                                    <li>• One application per account</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                        >
                            Apply Now
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <School className="text-brand-600" size={28} />
                            <h2 className="text-2xl font-bold dark:text-white">Verification Form</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Institution Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Stanford University"
                                    value={formData.institution}
                                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Your Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Year / Position</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. 3rd Year / Professor"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ID Card Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                                {!idImage ? (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <Upload size={24} />
                                        <span className="text-sm font-bold">Upload ID Card Photo</span>
                                    </button>
                                ) : (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                        <img src={idImage} alt="ID card" className="w-full h-40 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold"
                                        >
                                            Change Photo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !idImage}
                                className="flex-2 py-4 px-8 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black dark:text-white mb-4">Application Sent!</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                            We've received your education plan application. Our team will review your ID card and upgrade your account within 24-48 hours. You'll receive an email once approved.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                        >
                            Got it
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
