import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
    UploadCloud, Network, Layers, BrainCircuit, MessageSquare, FileText, Moon, Sun, Loader2, ClipboardPaste, Sparkles, Edit3, LayoutDashboard, Lightbulb, Minimize2, Maximize2, Bot, LogOut, Send, FileQuestion, ArrowLeft, ArrowRight, Search, AlertTriangle, XCircle, User, Download, Baby, Headphones, CheckSquare, Settings, Play, Lock, Zap, Podcast, History, Calendar, Book, Menu, HelpCircle
} from 'lucide-react';
import { extractTextFromFile } from '../services/fileService';
import {
    generateTargetedMindMap, extractTopics, generateCustomFlashcards, generateCustomQuiz,
    generateSummary, chatWithPDF, generateKeyConcepts, generateELI5, generatePodcast,
    generateMnemonics, generateStudySchedule, generateExamPredictions, generateVocabulary, submitErrorReport
} from '../services/aiService';
import { MindMap } from './MindMap';
import { Quiz } from './Quiz';
import { Flashcards } from './Flashcards';
import { SummaryView } from './SummaryView';
import { KeyConcepts } from './KeyConcepts';
import { ToastContainer, ToastMessage } from './Toast';
import { MindMapNode, AppView, Flashcard, Question, ChatMessage, KeyConcept } from '../types';
import { SpotlightCard } from './SpotlightCard';
import { SmartPlayer } from './SmartPlayer';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { PricingModal } from './PricingModal';
import { TutorialModal } from './TutorialModal';
import { Mnemonics } from './Mnemonics';
import { StudySchedule } from './StudySchedule';
import { ExamPredictor } from './ExamPredictor';
import { VocabularyBuilder } from './VocabularyBuilder';
import { BrandLogo } from './BrandLogo';
import { SuggestToolModal } from './SuggestToolModal';

const uuid = () => Math.random().toString(36).substring(2, 9);

const stripMarkdown = (text: string) => {
    if (!text) return "";
    return text.replace(/[#*`_\[\]]/g, '').replace(/\n+/g, ' ').trim();
};

export const Workspace = ({ onExit, darkMode, setDarkMode, externalCommand, onOpenReferral, addGlobalToast }: any) => {
    const { user, incrementUsage, decrementUsage, tier, usage, loading: authLoading, signOut, daysLeft, daysUsed } = useAuth();
    const [view, setView] = useState<AppView>(AppView.UPLOAD);
    const [summaryLanguage, setSummaryLanguage] = useState('English');
    const [eli5Language, setEli5Language] = useState('English');
    const [docText, setDocText] = useState('');
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [inputType, setInputType] = useState<'file' | 'text'>('file');
    const [rawText, setRawText] = useState('');

    // Modals
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [showSuggestModal, setShowSuggestModal] = useState(false);
    const [showMobileMore, setShowMobileMore] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const generationsThisSession = useRef(0);
    const hasAttemptedRestore = useRef(false);

    // Initial check for tutorial
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('focusmind_tutorial_seen_v2');
        if (!hasSeenTutorial) {
            setShowTutorialModal(true);
        }
    }, []);

    // Wizard & Data States
    const [wizardMode, setWizardMode] = useState<'NONE' | 'MINDMAP_TOPICS' | 'QUIZ_CONFIG' | 'FLASHCARD_CONFIG'>('NONE');
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [quizConfig, setQuizConfig] = useState({ count: 5, difficulty: 'Medium', type: 'Multiple Choice', language: 'English' });
    const [flashcardConfig, setFlashcardConfig] = useState({ count: 10, difficulty: 'Medium', style: 'Standard', language: 'English' });

    const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [quiz, setQuiz] = useState<Question[]>([]);
    const [concepts, setConcepts] = useState<KeyConcept[]>([]);
    const [mnemonicsData, setMnemonicsData] = useState<any[]>([]);
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    const [examPredictions, setExamPredictions] = useState<any[]>([]);
    const [vocabularyData, setVocabularyData] = useState<any[]>([]);
    const [summary, setSummary] = useState('');
    const [eli5Text, setEli5Text] = useState('');
    const [podcastData, setPodcastData] = useState<{ audio: string, script: string } | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (type: any, message: string) => {
        if (addGlobalToast) addGlobalToast(type, message);
        else setToasts(prev => [...prev, { id: uuid(), type, message }]);
    };
    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    // Auto-close SmartPlayer when switching away from audio-enabled views
    useEffect(() => {
        if (view !== AppView.ELI5 && view !== AppView.SUMMARY) {
            setShowPlayer(false);
        }
    }, [view]);

    useEffect(() => {
        if (authLoading || !user || hasAttemptedRestore.current) return;

        const savedStateStr = localStorage.getItem(`focusmind_workspace_${user.id}`);
        if (savedStateStr) {
            hasAttemptedRestore.current = true;

            if (tier === 'pro') {
                try {
                    const savedState = JSON.parse(savedStateStr);
                    if (savedState.docText) {
                        setDocText(savedState.docText || '');
                        setFileName(savedState.fileName || '');
                        setRawText(savedState.rawText || '');
                        setView(savedState.view || AppView.UPLOAD);
                        setSummary(savedState.summary || '');
                        setMindMap(savedState.mindMap || null);
                        setFlashcards(savedState.flashcards || []);
                        setQuiz(savedState.quiz || []);
                        setConcepts(savedState.concepts || []);
                        setEli5Text(savedState.eli5Text || '');
                        setPodcastData(savedState.podcastData || null);
                        setChatHistory(savedState.chatHistory || []);
                        setMnemonicsData(savedState.mnemonicsData || []);
                        setExamPredictions(savedState.examPredictions || []);
                        setVocabularyData(savedState.vocabularyData || []);
                        setScheduleData(savedState.scheduleData || []);
                    }
                } catch (e) {
                    console.error("Failed to parse saved state", e);
                }
            } else {
                addToast('info', 'Upgrade to Pro to automatically restore your last session!');
            }
        }
    }, [user, tier, authLoading]);

    // Auto-save session for Pro users
    useEffect(() => {
        if (!user || tier !== 'pro' || !docText) return;
        const timeout = setTimeout(() => {
            try {
                localStorage.setItem(`focusmind_workspace_${user.id}`, JSON.stringify({
                    docText, fileName, rawText, view, summary, mindMap,
                    flashcards, quiz, concepts, eli5Text, podcastData, chatHistory,
                    mnemonicsData, examPredictions, vocabularyData, scheduleData
                }));
            } catch (e) { console.error("Failed to save session", e); }
        }, 1000); // Debounce 1 second
        return () => clearTimeout(timeout);
    }, [user, tier, docText, fileName, rawText, view, summary, mindMap, flashcards, quiz, concepts, eli5Text, podcastData, chatHistory, mnemonicsData, examPredictions, vocabularyData, scheduleData]);

    // External Command Listener (e.g., from Navbar)
    useEffect(() => {
        if (externalCommand && externalCommand.action === 'openReferral') {
            if (onOpenReferral) onOpenReferral();
            else setShowReferralModal(true);
        }
    }, [externalCommand, onOpenReferral]);

    // Tutorial Trigger

    const handleTutorialClose = () => {
        localStorage.setItem('focusmind_tutorial_seen', 'true');
        setShowTutorialModal(false);
    };

    useEffect(() => {
        if (!user || !docText) return;

        const stateToSave = {
            docText, fileName, rawText, view, summary, summaryLanguage, eli5Language, mindMap, flashcards, quiz, concepts, mnemonicsData, scheduleData, eli5Text, podcastData, chatHistory
        };

        const timeoutId = setTimeout(() => {
            localStorage.setItem(`focusmind_workspace_${user.id}`, JSON.stringify(stateToSave));
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [docText, fileName, rawText, view, summary, mindMap, flashcards, quiz, concepts, eli5Text, podcastData, chatHistory, user]);

    const checkLimits = async () => {
        if (!user) {
            setShowAuthModal(true);
            return false;
        }
        const allowed = await incrementUsage();
        if (!allowed) {
            setShowPricingModal(true);
            return false;
        }
        return true;
    };

    const processText = async (text: string, name: string, language: string) => {
        // 1. Validation check FIRST
        const maxLimit = tier === 'pro' ? 100000 : 50000;
        if (text.length > maxLimit) {
            addToast('error', `File too large. Free limit is 50k chars, Pro is 100k chars. Yours: ${text.length}`);
            setLoading(false);
            return;
        }

        // 2. Increment Usage (Charge)
        if (!await checkLimits()) {
            setLoading(false);
            return;
        }

        setDocText(text);
        setFileName(name);
        setLoading(true);
        setLoadingMsg("Generating Command Center...");

        try {
            const summaryText = await generateSummary(text, language, () => {
                setLoadingMsg(`AI is processing...`);
            }, tier);
            setSummary(summaryText);
            setView(AppView.SUMMARY);
            addToast('success', 'Document processed successfully!');

            // Suggest Tool Trigger
            generationsThisSession.current += 1;
            if (generationsThisSession.current === 5) {
                setShowSuggestModal(true);
            }
        } catch (err: any) {
            console.error(err);
            if (err.message === "WEBSITE_UNDER_DEVELOPMENT") {
                setErrorMessage("This tool is currently under maintenance. We've notified our developers!");
            } else {
                setErrorMessage(err.message || "Failed to process document.");
            }
            setShowErrorModal(true);
            // 3. Refund usage on failure
            await decrementUsage();
            addToast('error', "Failed to process document. Usage refunded.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (loading) return;
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        setLoadingMsg("Scanning document...");
        try {
            const text = await extractTextFromFile(file);
            await processText(text, file.name, summaryLanguage);
        } catch (err: any) {
            addToast('error', err.message);
            // No decrement needed as processText wasn't called yet
            setLoading(false);
        }
    };

    const handleTextSubmit = async () => {
        if (loading) return;
        if (!rawText.trim() || rawText.length < 50) {
            addToast('error', 'Please enter at least 50 characters.');
            return;
        }
        setLoading(true);
        setLoadingMsg("Processing text...");
        try {
            await processText(rawText, "My Notes", summaryLanguage);
        } catch (e) {
            setLoading(false);
        }
    };

    const handleGenerate = async (targetView: AppView, forceWizard: boolean = false) => {
        if (loading) return;
        if (!docText && targetView !== AppView.UPLOAD) {
            addToast('warning', "Upload a document or enter text first!");
            return;
        }

        // Feature Gating
        const proFeatures = [AppView.PODCAST, AppView.MNEMONICS, AppView.STUDY_SCHEDULE, AppView.EXAM_PREDICTOR, AppView.VOCABULARY_BUILDER];
        if (proFeatures.includes(targetView) && tier !== 'pro') {
            setShowPricingModal(true);
            return;
        }

        if (targetView === AppView.UPLOAD) { setView(targetView); return; }

        // Check Config Needs
        if (targetView === AppView.MINDMAP && (!mindMap || forceWizard)) {
            setLoading(true);
            setLoadingMsg("Analyzing topics...");
            try {
                const topics = await extractTopics(docText, () => { }, tier);
                setAvailableTopics(topics);
                setSelectedTopics(topics.slice(0, 4));
                setWizardMode('MINDMAP_TOPICS');
            } catch (e) {
                console.error(e);
            } finally { setLoading(false); }
            return;
        }
        if (targetView === AppView.QUIZ && (quiz.length === 0 || forceWizard)) {
            setWizardMode('QUIZ_CONFIG');
            return;
        }
        if (targetView === AppView.FLASHCARDS && (flashcards.length === 0 || forceWizard)) {
            setWizardMode('FLASHCARD_CONFIG');
            return;
        }

        // Direct Gens
        if (targetView === AppView.KEY_CONCEPTS && concepts.length === 0) {
            if (!await checkLimits()) return;
            setLoading(true);
            setLoadingMsg("Extracting Concepts...");
            try {
                const c = await generateKeyConcepts(docText, () => setLoadingMsg(`Extracting concepts...`), tier);
                if (c.length === 0) throw new Error("No concepts found.");
                setConcepts(c);
                setView(targetView);
            } catch (e: any) {
                await decrementUsage();
                addToast('error', "Failed to generate concepts. Usage refunded.");
            } finally { setLoading(false); }
            return;
        }

        if (targetView === AppView.EXAM_PREDICTOR && examPredictions.length === 0) {
            if (!await checkLimits()) return;
            setLoading(true);
            setLoadingMsg("Predicting questions...");
            try {
                const data = await generateExamPredictions(docText, () => setLoadingMsg(`Analyzing content...`), tier);
                setExamPredictions(data);
                setView(targetView);
            } catch (e: any) {
                await decrementUsage();
                addToast('error', "Failed to predict questions. Usage refunded.");
            } finally { setLoading(false); }
            return;
        }

        if (targetView === AppView.VOCABULARY_BUILDER && vocabularyData.length === 0) {
            if (!await checkLimits()) return;
            setLoading(true);
            setLoadingMsg("Building vocabulary...");
            try {
                const data = await generateVocabulary(docText, () => setLoadingMsg(`Extracting words...`), tier);
                setVocabularyData(data);
                setView(targetView);
            } catch (e: any) {
                await decrementUsage();
                addToast('error', "Failed to build vocabulary. Usage refunded.");
            } finally { setLoading(false); }
            return;
        }

        if (targetView === AppView.ELI5 && !eli5Text) {
            if (!await checkLimits()) return;
            setLoading(true);
            setLoadingMsg("Simplifying...");
            try {
                const t = await generateELI5(docText, eli5Language, () => setLoadingMsg(`Simplifying text...`), tier);
                setEli5Text(t);
                setView(targetView);
            } catch (e: any) {
                await decrementUsage();
                addToast('error', "Failed to generate simplified text. Usage refunded.");
            } finally { setLoading(false); }
            return;
        }
        if (targetView === AppView.PODCAST && !podcastData) {
            if (tier !== 'pro') { setShowPricingModal(true); return; }
            if (!await checkLimits()) return;
            setLoading(true);
            setLoadingMsg("Generating Podcast...");
            try {
                const data = await generatePodcast(docText, () => setLoadingMsg(`Generating Podcast...`), tier);
                setPodcastData(data);
                setView(targetView);
            } catch (e: any) {
                await decrementUsage();
                addToast('error', "Failed to generate podcast. Usage refunded.");
            } finally { setLoading(false); }
            return;
        }
        if (targetView === AppView.MNEMONICS && mnemonicsData.length === 0) {
            if (!await checkLimits()) return;
            setLoading(true);
            setLoadingMsg("Generating Memory Aids...");
            try {
                const c = await generateMnemonics(docText, () => setLoadingMsg(`Generating Mnemonics...`), tier);
                if (c.length === 0) throw new Error("No mnemonics found.");
                setMnemonicsData(c);
                setView(targetView);
            } catch (e: any) {
                await decrementUsage();
                addToast('error', "Failed to generate mnemonics. Usage refunded.");
            } finally { setLoading(false); }
            return;
        }
        if (targetView === AppView.STUDY_SCHEDULE && scheduleData.length === 0) {
            if (!await checkLimits()) return;
            setLoading(true);
            setLoadingMsg("Creating Study Plan...");
            try {
                const s = await generateStudySchedule(docText, () => setLoadingMsg(`Planning schedule...`), tier);
                if (s.length === 0) throw new Error("Failed to create plan.");
                setScheduleData(s as any);
                setView(targetView);
            } catch (e: any) {
                await decrementUsage();
                addToast('error', "Failed to generate schedule. Usage refunded.");
            } finally { setLoading(false); }
            return;
        }

        setView(targetView);
    };

    const handleReportError = (err: any) => {
        setErrorMessage(err.message || String(err));
        setShowErrorModal(true);
    };

    const submitError = async () => {
        setLoading(true);
        setLoadingMsg("Submitting report...");
        try {
            await submitErrorReport(errorMessage, user?.email || 'Anonymous');
            setShowErrorModal(false);
            addToast('success', 'Error report submitted. Thank you!');
        } catch (e) {
            addToast('error', 'Failed to submit error report.');
        } finally {
            setLoading(false);
        }
    };

    const generateMindMapFinal = async () => {
        if (loading) return;
        if (!await checkLimits()) return;
        setWizardMode('NONE');
        setLoading(true);
        setLoadingMsg("Mapping topics...");
        try {
            const data = await generateTargetedMindMap(docText, selectedTopics, () => setLoadingMsg(`Mapping topics...`), tier);
            setMindMap(data);
            setView(AppView.MINDMAP);
        } catch (e: any) {
            await decrementUsage();
            addToast('error', "Failed to generate mind map. Usage refunded.");
        } finally { setLoading(false); }
    };

    // --- MindMap Interactivity Handlers ---
    const findAndUpdate = (root: MindMapNode, id: string, updater: (node: MindMapNode) => MindMapNode | null): MindMapNode | null => {
        if (root.id === id) return updater(root);
        if (root.children) {
            const newChildren: MindMapNode[] = [];
            for (const child of root.children) {
                const result = findAndUpdate(child, id, updater);
                if (result !== null) newChildren.push(result);
            }
            return { ...root, children: newChildren };
        }
        return root;
    };

    const handleEditNode = (node: MindMapNode) => {
        const newLabel = prompt("Rename node:", node.label);
        if (newLabel && newLabel.trim() && mindMap) {
            const updated = findAndUpdate(mindMap, node.id, (n) => ({ ...n, label: newLabel.trim() }));
            if (updated) setMindMap(updated);
        }
    };

    const handleAddNode = (parentId: string) => {
        const label = prompt("New sub-topic name:");
        if (label && label.trim() && mindMap) {
            const newNode: MindMapNode = { id: uuid(), label: label.trim(), children: [] };
            const updated = findAndUpdate(mindMap, parentId, (n) => ({
                ...n, children: [...(n.children || []), newNode]
            }));
            if (updated) setMindMap(updated);
        }
    };

    const handleDeleteNode = (nodeId: string) => {
        if (!mindMap || nodeId === mindMap.id) { addToast('warning', 'Cannot delete root node.'); return; }
        const updated = findAndUpdate(mindMap, nodeId, () => null);
        if (updated) setMindMap(updated);
    };

    const handleMoveNode = (nodeId: string, newParentId: string) => {
        if (!mindMap) return;
        let movedNode: MindMapNode | null = null;
        // 1. Remove from old parent
        const withRemoved = findAndUpdate(mindMap, nodeId, (n) => { movedNode = n; return null; });
        if (!movedNode || !withRemoved) return;
        // 2. Add to new parent
        const withAdded = findAndUpdate(withRemoved, newParentId, (n) => ({
            ...n, children: [...(n.children || []), movedNode!]
        }));
        if (withAdded) setMindMap(withAdded);
    };

    const handleColorChange = (nodeId: string, color: string | undefined) => {
        if (!mindMap) return;
        const updated = findAndUpdate(mindMap, nodeId, (n) => ({ ...n, color }));
        if (updated) setMindMap(updated);
    };

    const generateQuizFinal = async () => {
        if (loading) return;
        if (!await checkLimits()) return;
        setWizardMode('NONE');
        setLoading(true);
        setLoadingMsg("Creating Quiz...");
        try {
            const q = await generateCustomQuiz(docText, quizConfig.count, quizConfig.difficulty, quizConfig.type, quizConfig.language, () => setLoadingMsg(`Generating Quiz...`), tier);
            if (q.length === 0) throw new Error("Failed");
            setQuiz(q);
            setView(AppView.QUIZ);
        } catch (e: any) {
            await decrementUsage();
            addToast('error', "Quiz generation failed. Usage refunded.");
        } finally { setLoading(false); }
    };

    const generateFlashcardsFinal = async () => {
        if (loading) return;
        if (!await checkLimits()) return;
        setWizardMode('NONE');
        setLoading(true);
        setLoadingMsg("Drafting Cards...");
        try {
            const c = await generateCustomFlashcards(docText, flashcardConfig.count, flashcardConfig.difficulty, flashcardConfig.style, flashcardConfig.language, () => setLoadingMsg(`Drafting cards...`), tier);
            if (c.length === 0) throw new Error("Failed");
            setFlashcards(c);
            setView(AppView.FLASHCARDS);
        } catch (e: any) {
            await decrementUsage();
            addToast('error', "Flashcard generation failed. Usage refunded.");
        } finally { setLoading(false); }
    };

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isChatLoading) return;
        if (!chatInput.trim()) return;
        if (!await checkLimits()) return;

        const userMsg: ChatMessage = { id: uuid(), role: 'user', content: chatInput, timestamp: Date.now() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const response = await chatWithPDF([...chatHistory, userMsg], docText, () => { }, tier);
            setChatHistory(prev => [...prev, { id: uuid(), role: 'assistant', content: response, timestamp: Date.now() }]);
        } catch (e: any) {
            console.error(e);
            await decrementUsage();
            addToast('error', "Failed to get response. Usage refunded.");
        } finally { setIsChatLoading(false); }
    };

    const renderWizard = () => {
        if (wizardMode === 'NONE') return null;
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-pop border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Configure Generation</h2>
                    {wizardMode === 'MINDMAP_TOPICS' && (
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            {availableTopics.map(t => (
                                <button key={t} onClick={() => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`w-full p-3 rounded-xl text-left ${selectedTopics.includes(t) ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 dark:text-white'}`}>{t}</button>
                            ))}
                        </div>
                    )}
                    {wizardMode === 'QUIZ_CONFIG' && (
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Count: {quizConfig.count}</label>
                                <input type="range" min="3" max={tier === 'pro' ? 50 : 10} value={quizConfig.count} onChange={e => setQuizConfig({ ...quizConfig, count: +e.target.value })} className="w-full accent-brand-600" />
                                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>3</span><span>{tier === 'pro' ? 50 : 10}</span></div>
                            </div>
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Difficulty</label>
                                <select value={quizConfig.difficulty} onChange={e => setQuizConfig({ ...quizConfig, difficulty: e.target.value })} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-brand-500">
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Type</label>
                                <select value={quizConfig.type} onChange={e => setQuizConfig({ ...quizConfig, type: e.target.value })} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-brand-500">
                                    <option value="Multiple Choice">Multiple Choice</option>
                                    <option value="True/False">True/False</option>
                                    <option value="Fill in the Blanks">Fill in the Blanks</option>
                                </select>
                            </div>
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Language {tier !== 'pro' && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase ml-1">Pro</span>}</label>
                                <select value={quizConfig.language} onChange={e => setQuizConfig({ ...quizConfig, language: e.target.value })} disabled={tier !== 'pro'} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50">
                                    <option value="English">English</option>
                                    {tier === 'pro' && (
                                        <>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Urdu">Urdu</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    )}
                    {wizardMode === 'FLASHCARD_CONFIG' && (
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Count: {flashcardConfig.count}</label>
                                <input type="range" min="3" max={tier === 'pro' ? 100 : 15} value={flashcardConfig.count} onChange={e => setFlashcardConfig({ ...flashcardConfig, count: +e.target.value })} className="w-full accent-brand-600" />
                                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>3</span><span>{tier === 'pro' ? 100 : 15}</span></div>
                            </div>
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Difficulty</label>
                                <select value={flashcardConfig.difficulty} onChange={e => setFlashcardConfig({ ...flashcardConfig, difficulty: e.target.value })} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-brand-500">
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Style</label>
                                <select value={flashcardConfig.style} onChange={e => setFlashcardConfig({ ...flashcardConfig, style: e.target.value })} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-brand-500">
                                    <option value="Standard">Standard (Term/Definition)</option>
                                    <option value="Question/Answer">Question/Answer</option>
                                    <option value="Scenario-based">Scenario-based</option>
                                </select>
                            </div>
                            <div>
                                <label className="block dark:text-white font-bold mb-2">Language {tier !== 'pro' && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase ml-1">Pro</span>}</label>
                                <select value={flashcardConfig.language} onChange={e => setFlashcardConfig({ ...flashcardConfig, language: e.target.value })} disabled={tier !== 'pro'} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50">
                                    <option value="English">English</option>
                                    {tier === 'pro' && (
                                        <>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Urdu">Urdu</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setWizardMode('NONE')} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button onClick={() => wizardMode === 'MINDMAP_TOPICS' ? generateMindMapFinal() : wizardMode === 'QUIZ_CONFIG' ? generateQuizFinal() : generateFlashcardsFinal()} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold">Generate</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-700 ease-out-expo relative">
            {/* ToastContainer is now global in App.tsx */}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
            {showSuggestModal && <SuggestToolModal
                onClose={() => setShowSuggestModal(false)}
                userEmail={user?.email || ''}
                userName={user?.user_metadata?.full_name || ''}
            />}
            {showTutorialModal && <TutorialModal onClose={handleTutorialClose} />}
            {/* Referral Modal is now global in App.tsx */}
            {showRestoreModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-pop border border-slate-200 dark:border-slate-700 text-center">
                        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <History size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">Restore Session?</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            We found your previous unsaved work. Upgrading to Pro allows you to automatically save and restore your sessions.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { setShowRestoreModal(false); setShowPricingModal(true); }} className="w-full py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
                                <Zap size={18} fill="currentColor" /> Upgrade to Restore
                            </button>
                            <button onClick={() => {
                                setShowRestoreModal(false);
                                if (user) localStorage.removeItem(`focusmind_workspace_${user.id}`);
                            }} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                                Discard Previous Work
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showErrorModal && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-pop border border-red-200 dark:border-red-900/30">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-center mb-4 dark:text-white">
                            {errorMessage === "WEBSITE_UNDER_DEVELOPMENT" ? "Under Development" : "Something went wrong"}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
                            We've captured this error. Help us improve by submitting a report.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowErrorModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold">Dismiss</button>
                            <button
                                onClick={async () => {
                                    await submitErrorReport(errorMessage, user?.email || 'anon');
                                    addToast('success', 'Issue reported to developer!');
                                    setShowErrorModal(false);
                                }}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20"
                            >
                                Report Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPlayer && (summary || eli5Text) && <SmartPlayer text={view === AppView.ELI5 ? eli5Text : summary} onClose={() => setShowPlayer(false)} />}
            {renderWizard()}

            {loading && (
                <div className="absolute inset-0 z-[100] bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-6 animate-pop">
                        <Loader2 size={48} className="text-brand-600 animate-spin" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{loadingMsg}</h3>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="hidden md:flex w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex-col justify-between z-30 shadow-soft-xl">
                <div className="p-6 flex-1 overflow-y-auto scrollbar-thin">
                    <button onClick={onExit} className="mb-10 animate-enter-left">
                        <BrandLogo size="md" />
                    </button>

                    <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase text-slate-500">Plan Status</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${tier === 'pro' ? 'bg-brand-500 text-white shadow-glow' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                {tier.toUpperCase()}
                            </span>
                        </div>
                        <div className="space-y-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400">DAILY LIMIT</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{usage}/{tier === 'free' ? 10 : 100}</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${Math.min((usage / (tier === 'free' ? 10 : 100)) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {tier === 'pro' && (daysLeft !== null || daysUsed !== null) && (
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 animate-fade-in">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400 uppercase tracking-tighter">Pro Days Remaining</span>
                                    <span className="text-brand-600 dark:text-brand-400">{daysLeft ?? 0} Days</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400 uppercase tracking-tighter">Pro Days Used</span>
                                    <span className="text-slate-600 dark:text-slate-300">{daysUsed ?? 0} Days</span>
                                </div>
                            </div>
                        )}
                        {tier === 'free' && (
                            <button onClick={() => setShowPricingModal(true)} className="mt-4 w-full py-2 text-xs font-bold bg-slate-900 text-white rounded-xl flex items-center justify-center gap-1 hover:bg-brand-600 transition-all shadow-lg active:scale-95"><Zap size={12} /> Unlock Pro Features</button>
                        )}
                    </div>

                    <nav className="space-y-2">
                        <button onClick={() => setView(AppView.UPLOAD)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${view === AppView.UPLOAD ? 'bg-white dark:bg-slate-800 text-brand-600' : 'text-slate-500 hover:bg-white/50'}`}>
                            <LayoutDashboard size={20} /> <span>Command Center</span>
                        </button>
                        {docText && (
                            <button onClick={() => {
                                if (window.confirm("Start a new document? This will clear your current progress.")) {
                                    setDocText(''); setFileName(''); setRawText(''); setView(AppView.UPLOAD); setSummary(''); setMindMap(null); setFlashcards([]); setQuiz([]); setConcepts([]); setMnemonicsData([]); setScheduleData([]); setEli5Text(''); setPodcastData(null); setChatHistory([]);
                                    if (user) localStorage.removeItem(`focusmind_workspace_${user.id}`);
                                }
                            }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50">
                                <FileText size={20} /> <span>New Document</span>
                            </button>
                        )}
                        <div className="pt-4 pb-2 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">AI Tools</div>
                        {[
                            { id: AppView.SUMMARY, icon: FileText, label: 'Smart Summary', color: 'text-amber-500' },
                            { id: AppView.MINDMAP, icon: Network, label: 'Mind Map', color: 'text-blue-500' },
                            { id: AppView.FLASHCARDS, icon: Layers, label: 'Flashcards', color: 'text-emerald-500' },
                            { id: AppView.QUIZ, icon: FileQuestion, label: 'Practice Quiz', color: 'text-rose-500' },
                            { id: AppView.KEY_CONCEPTS, icon: Lightbulb, label: 'Key Concepts', color: 'text-amber-500' },
                            { id: AppView.MNEMONICS, icon: Sparkles, label: 'Memory Aids', pro: true, color: 'text-purple-500' },
                            { id: AppView.STUDY_SCHEDULE, icon: Calendar, label: 'Study Plan', pro: true, color: 'text-indigo-500' },
                            { id: AppView.EXAM_PREDICTOR, icon: AlertTriangle, label: 'Exam Predictor', pro: true, color: 'text-red-500' },
                            { id: AppView.VOCABULARY_BUILDER, icon: Book, label: 'Vocabulary Builder', pro: true, color: 'text-blue-600' },
                            { id: AppView.CHAT, icon: MessageSquare, label: 'AI Tutor', color: 'text-brand-600' },
                            { id: AppView.ELI5, icon: Baby, label: 'ELI5 Mode', color: 'text-pink-500' },
                            { id: AppView.PODCAST, icon: Podcast, label: 'AI Podcast', pro: true, color: 'text-purple-600' }
                        ].map(item => {
                            const isLocked = item.pro && tier !== 'pro';
                            const isActive = view === item.id;
                            const displayColor = isLocked ? 'text-slate-400' : (isActive ? item.color : `${item.color.replace('500', '400').replace('600', '500')} opacity-70 group-hover:opacity-100`);

                            return (
                                <button key={item.id} onClick={() => handleGenerate(item.id)} className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-white dark:bg-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className={`transition-all duration-300 ${displayColor}`} />
                                        <span className={`transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>{item.label}</span>
                                    </div>
                                    {isLocked && <span className="text-[9px] bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">Pro</span>}
                                </button>
                            );
                        })}
                    </nav>
                </div >
                <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
                    <button onClick={() => {
                        if (user) {
                            if (onOpenReferral) onOpenReferral();
                            else setShowReferralModal(true);
                        }
                        else setShowAuthModal(true);
                    }} className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-xl font-medium transition-all text-brand-600 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-800/50">
                        <div className="flex items-center gap-2">
                            <Zap size={18} /> <span className="text-sm">Refer & Earn</span>
                        </div>
                        <span className="text-[10px] font-bold bg-brand-200 dark:bg-brand-800 px-1.5 py-0.5 rounded-md">+7 Days</span>
                    </button>
                    <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs">
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />} <span className="font-medium">Theme</span>
                    </button>
                    <button onClick={() => setShowSuggestModal(true)} className="w-full flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs">
                        <Lightbulb size={18} /> <span className="font-medium">Suggest a Tool</span>
                    </button>
                    <button onClick={() => setShowTutorialModal(true)} className="w-full flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs">
                        <HelpCircle size={18} /> <span className="font-medium">Show Tutorial</span>
                    </button>
                    <button onClick={onExit} className="w-full flex items-center gap-3 p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-1 text-xs">
                        <LogOut size={18} /> <span className="font-medium">Exit Workspace</span>
                    </button>
                </div>
            </aside >

            <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
                <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0"><FileText size={18} className="text-brand-500" /></div>
                        <h2 className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px] md:max-w-md">{fileName || 'Untitled Document'}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {!user && <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 shadow-lg active:scale-95 transition-all">Sign In to Save</button>}

                        {(view === AppView.SUMMARY || (view === AppView.ELI5 && eli5Text)) && (
                            <button onClick={() => {
                                if (tier !== 'pro') {
                                    setShowPricingModal(true);
                                    return;
                                }
                                setShowPlayer(!showPlayer);
                            }} className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl text-sm font-bold hover:bg-brand-100 transition-colors border border-brand-100 dark:border-brand-900/50">
                                <Headphones size={16} /> Listen {tier !== 'pro' && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-md uppercase ml-1">Pro</span>}
                            </button>
                        )}

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all overflow-hidden"
                                >
                                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </button>

                                {(profileOpen) && (
                                    <>
                                        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setProfileOpen(false)}></div>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-glass border border-slate-200 dark:border-slate-800 py-2 transition-all duration-300 z-50 animate-pop">
                                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                                            </div>
                                            <button onClick={() => { setShowPricingModal(true); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                                <Zap size={16} /> {tier === 'pro' ? 'Subscription' : 'Upgrade to Pro'}
                                            </button>
                                            <button onClick={() => {
                                                if (onOpenReferral) onOpenReferral();
                                                else setShowReferralModal(true);
                                                setProfileOpen(false);
                                            }} className="w-full text-left px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 flex items-center gap-2">
                                                <Sparkles size={16} /> Refer & Earn Pro
                                            </button>
                                            <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                                                <button onClick={() => {
                                                    signOut();
                                                    onExit();
                                                }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative p-0">
                    {view === AppView.UPLOAD ? (
                        !docText ? (
                            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
                                <div className="max-w-xl w-full text-center space-y-8 animate-slide-up relative z-10">
                                    <div className="inline-flex p-6 rounded-[2rem] bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-brand-600 mb-2 shadow-glow animate-bounce-subtle border border-white/20">
                                        {inputType === 'file' ? <UploadCloud size={64} /> : <ClipboardPaste size={64} />}
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white">{inputType === 'file' ? 'Upload Material' : 'Paste Content'}</h1>
                                    <div className="flex justify-center mb-8 gap-4 flex-wrap">
                                        <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl inline-flex backdrop-blur-sm">
                                            <button onClick={() => setInputType('file')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${inputType === 'file' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>File Upload</button>
                                            <button onClick={() => setInputType('text')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${inputType === 'text' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>Direct Text</button>
                                        </div>
                                        <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl inline-flex backdrop-blur-sm items-center px-4">
                                            <span className="text-sm font-bold text-slate-500 mr-2">Language:</span>
                                            <select value={summaryLanguage} onChange={e => setSummaryLanguage(e.target.value)} disabled={tier !== 'pro'} className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer disabled:opacity-50 appearance-none text-center">
                                                <option value="English">English {tier !== 'pro' && '(Pro)'}</option>
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
                                        </div>
                                    </div>

                                    {inputType === 'file' ? (
                                        <label className="block w-full cursor-pointer group perspective-1000">
                                            <input type="file" onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" />
                                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2.5rem] p-12 md:p-16 transition-all hover:border-brand-500 hover:bg-brand-50/30">
                                                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">Click to Browse</div>
                                                <p className="text-slate-400 font-medium">PDF, TXT (Max {tier === 'pro' ? '100k' : '50k'} chars)</p>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="w-full relative">
                                            <textarea
                                                value={rawText}
                                                onChange={(e) => setRawText(e.target.value)}
                                                placeholder="Paste your notes..."
                                                className="w-full h-48 md:h-60 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-brand-500 resize-none text-slate-700 dark:text-slate-300 transition-all"
                                                style={{ fontSize: '16px' }}
                                            ></textarea>
                                            <div className="mt-4 md:mt-6 flex justify-end">
                                                <button onClick={handleTextSubmit} disabled={loading} className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-glow transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} {loading ? loadingMsg : 'Analyze Text'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <DashboardContent handleGenerate={handleGenerate} summary={summary} />
                        )
                    ) : (
                        <>
                            {view === AppView.SUMMARY && (
                                <SummaryView
                                    summary={summary}
                                    tier={tier}
                                    currentLanguage={summaryLanguage}
                                    onRegenerate={async (lang) => {
                                        setSummaryLanguage(lang);
                                        if (!await checkLimits()) return;
                                        setLoading(true);
                                        setLoadingMsg("Regenerating Summary...");
                                        try {
                                            const s = await generateSummary(docText, lang, () => { }, tier);
                                            setSummary(s);
                                        } catch (e) { handleReportError(e); }
                                        finally { setLoading(false); }
                                    }}
                                />
                            )}
                            {view === AppView.MINDMAP && mindMap && <MindMap data={mindMap} onNodeClick={() => { }} onEditNode={handleEditNode} onAddNode={handleAddNode} onDeleteNode={handleDeleteNode} onMoveNode={handleMoveNode} onColorChange={handleColorChange} />}
                            {view === AppView.FLASHCARDS && <Flashcards cards={flashcards} onRegenerate={() => handleGenerate(AppView.FLASHCARDS, true)} />}
                            {view === AppView.QUIZ && <Quiz questions={quiz} onRegenerate={() => handleGenerate(AppView.QUIZ, true)} />}
                            {view === AppView.KEY_CONCEPTS && <KeyConcepts concepts={concepts} onRegenerate={() => handleGenerate(AppView.KEY_CONCEPTS, true)} />}
                            {view === AppView.MNEMONICS && <Mnemonics mnemonics={mnemonicsData} onRegenerate={() => handleGenerate(AppView.MNEMONICS, true)} />}
                            {view === AppView.STUDY_SCHEDULE && <StudySchedule schedule={scheduleData} onRegenerate={() => handleGenerate(AppView.STUDY_SCHEDULE, true)} />}
                            {view === AppView.EXAM_PREDICTOR && (
                                <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth animate-fade-in">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Predictor</h2>
                                        <button onClick={() => handleGenerate(AppView.EXAM_PREDICTOR, true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95">Regenerate</button>
                                    </div>
                                    <ExamPredictor predictions={examPredictions} />
                                </div>
                            )}
                            {view === AppView.VOCABULARY_BUILDER && (
                                <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth animate-fade-in">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vocabulary Builder</h2>
                                        <button onClick={() => handleGenerate(AppView.VOCABULARY_BUILDER, true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95">Regenerate</button>
                                    </div>
                                    <VocabularyBuilder
                                        vocabulary={vocabularyData}
                                        onSaveToFlashcards={(word, definition) => {
                                            const newCard: Flashcard = {
                                                id: uuid(),
                                                front: word,
                                                back: definition
                                            };
                                            setFlashcards(prev => [...prev, newCard]);
                                            addToast('success', `Saved "${word}" to Flashcards!`);
                                        }}
                                    />
                                </div>
                            )}
                            {view === AppView.ELI5 && (
                                <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth animate-fade-in">
                                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-glass border border-white/20 dark:border-white/5">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-600 shrink-0 shadow-sm"><Baby size={32} /></div>
                                                <div><h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">Explain Like I'm 5</h2></div>
                                            </div>
                                            <div className="flex items-center gap-3 self-end md:self-auto">
                                                <button onClick={() => handleGenerate(AppView.ELI5, true)} className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-bold hover:bg-pink-700 transition-all active:scale-95 shadow-lg shadow-pink-500/20">Regenerate</button>
                                                <select
                                                    value={eli5Language}
                                                    onChange={async (e) => {
                                                        const lang = e.target.value;
                                                        setEli5Language(lang);
                                                        if (!await checkLimits()) return;
                                                        setLoading(true);
                                                        setLoadingMsg("Simplifying...");
                                                        try {
                                                            const t = await generateELI5(docText, lang, () => { }, tier);
                                                            setEli5Text(t);
                                                        } catch (e) { handleReportError(e); }
                                                        finally { setLoading(false); }
                                                    }}
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
                                            </div>
                                        </div>
                                        <div className="prose prose-lg prose-pink dark:prose-invert max-w-none"><Markdown>{eli5Text}</Markdown></div>
                                    </div>
                                </div>
                            )}
                            {view === AppView.PODCAST && podcastData && (
                                <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto pb-24 scroll-smooth animate-fade-in">
                                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-glass border border-white/20 dark:border-white/5">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 shrink-0"><Podcast size={32} /></div>
                                            <div><h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">AI Podcast</h2></div>
                                        </div>
                                        <div className="mb-8 p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="text-lg font-bold mb-4 dark:text-white">Listen to the conversation</h3>
                                            <audio controls src={podcastData.audio} className="w-full" autoPlay />
                                        </div>
                                        <div className="prose prose-lg prose-purple dark:prose-invert max-w-none">
                                            <h3 className="dark:text-white">Transcript</h3>
                                            <Markdown>{podcastData.script}</Markdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {view === AppView.CHAT && (
                                <div className="flex flex-col h-full max-w-4xl mx-auto w-full animate-fade-in relative bg-slate-50 dark:bg-slate-950">
                                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-32 md:pb-36 scroll-smooth">
                                        {chatHistory.map(msg => (
                                            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-sm ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>{msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}</div>
                                                <div className={`max-w-[80%] p-4 rounded-[1.25rem] shadow-sm text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}><Markdown>{msg.content}</Markdown></div>
                                            </div>
                                        ))}
                                        {isChatLoading && <div className="flex gap-4 animate-fade-in"><Bot size={20} /><div className="bg-white dark:bg-slate-800 p-5 rounded-[1.25rem] shadow-sm"><Loader2 className="animate-spin" size={16} /></div></div>}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-30 pb-safe">
                                        <form onSubmit={handleChat} className="flex gap-3 relative max-w-4xl mx-auto">
                                            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a question..." className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-white" style={{ fontSize: '16px' }} />
                                            <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="p-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl"><Send size={20} /></button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around py-2 px-1 z-[55] pb-safe">
                <button onClick={() => setView(AppView.UPLOAD)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === AppView.UPLOAD ? 'text-brand-600' : 'text-slate-400'}`}>
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-bold">Home</span>
                </button>
                <button onClick={() => handleGenerate(AppView.SUMMARY)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === AppView.SUMMARY ? 'text-brand-600' : 'text-slate-400'}`}>
                    <FileText size={20} />
                    <span className="text-[10px] font-bold">Summary</span>
                </button>
                <button onClick={() => handleGenerate(AppView.CHAT)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === AppView.CHAT ? 'text-brand-600' : 'text-slate-400'}`}>
                    <MessageSquare size={20} />
                    <span className="text-[10px] font-bold">Tutor</span>
                </button>
                <button onClick={() => setShowMobileMore(!showMobileMore)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${showMobileMore ? 'text-brand-600' : 'text-slate-400'}`}>
                    <Menu size={20} />
                    <span className="text-[10px] font-bold">More</span>
                </button>
            </nav>

            {/* Mobile More Menu Overlay */}
            {
                showMobileMore && (
                    <div className="md:hidden fixed inset-0 z-[60] animate-fade-in">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileMore(false)}></div>
                        <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-slide-up border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold dark:text-white">Quick Menu</h3>
                                <button onClick={() => setShowMobileMore(false)} className="text-slate-400"><XCircle size={24} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => {
                                    if (onOpenReferral) onOpenReferral();
                                    else setShowReferralModal(true);
                                    setShowMobileMore(false);
                                }} className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex flex-col items-center gap-2 border border-brand-100 dark:border-brand-800/50">
                                    <Zap className="text-brand-600" size={24} />
                                    <span className="text-xs font-bold text-brand-700 dark:text-brand-400 text-center">Refer & <br />Earn Pro</span>
                                </button>
                                <button
                                    onClick={() => { setShowTutorialModal(true); setShowMobileMore(false); }}
                                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700"
                                >
                                    <HelpCircle className="text-blue-500" size={24} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">Show Tutorial</span>
                                </button>
                                <button onClick={() => { setShowSuggestModal(true); setShowMobileMore(false); }} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700">
                                    <Lightbulb className="text-amber-500" size={24} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">Suggest a <br />New Tool</span>
                                </button>
                                <button onClick={() => { handleGenerate(AppView.MINDMAP); setShowMobileMore(false); }} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700 text-center">
                                    <Network className="text-blue-500" size={24} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mind Map</span>
                                </button>
                                <button onClick={() => { handleGenerate(AppView.QUIZ); setShowMobileMore(false); }} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700 text-center">
                                    <FileQuestion className="text-rose-500" size={24} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Practice Quiz</span>
                                </button>
                                <button onClick={() => { setDarkMode(!darkMode); }} className="col-span-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-3">
                                    {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-500" />}
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Switch Theme</span>
                                </button>
                                <button onClick={onExit} className="col-span-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center gap-3 text-red-600 font-bold border border-red-100 dark:border-red-900/20">
                                    <LogOut size={20} />
                                    <span>Exit Workspace</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const DashboardContent = ({ handleGenerate, summary }: any) => (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                <SpotlightCard onClick={() => handleGenerate(AppView.SUMMARY)} className="col-span-1 md:col-span-2 row-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-glass border border-white/20 dark:border-white/5 hover:border-brand-300/50 transition-all duration-500 cursor-pointer group relative flex flex-col justify-between animate-scale-up delay-100 hover:shadow-soft-xl hover:-translate-y-1">
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Sparkles size={28} /></div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Smart Summary</h3>
                        <p className="text-slate-500 dark:text-slate-400 line-clamp-3">{summary ? stripMarkdown(summary.slice(0, 150)) + "..." : "Generate a concise overview."}</p>
                    </div>
                </SpotlightCard>
                <BentoItem title="Mind Map" desc="Visualize topics." icon={Network} iconBg="bg-blue-50 dark:bg-blue-900/20 text-blue-600" onClick={() => handleGenerate(AppView.MINDMAP)} delay={200} />
                <BentoItem title="Flashcards" desc="Active recall." icon={Layers} iconBg="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" onClick={() => handleGenerate(AppView.FLASHCARDS)} delay={300} />
                <BentoItem title="Quiz" desc="Test yourself." icon={FileQuestion} iconBg="bg-rose-50 dark:bg-rose-900/20 text-rose-600" onClick={() => handleGenerate(AppView.QUIZ)} delay={400} />
                <BentoItem title="ELI5 Mode" desc="Simplify text." icon={Baby} iconBg="bg-pink-50 dark:bg-pink-900/20 text-pink-600" onClick={() => handleGenerate(AppView.ELI5)} delay={500} />
                <BentoItem title="Study Plan" desc="Timelog." icon={Calendar} iconBg="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" onClick={() => handleGenerate(AppView.STUDY_SCHEDULE)} delay={550} isPro={true} />
                <BentoItem title="Mnemonics" desc="Memory aids." icon={BrainCircuit} iconBg="bg-amber-50 dark:bg-amber-900/20 text-amber-600" onClick={() => handleGenerate(AppView.MNEMONICS)} delay={600} isPro={true} />
                <BentoItem title="Exam Prep" desc="Likely questions." icon={AlertTriangle} iconBg="bg-rose-50 dark:bg-rose-900/20 text-rose-600" onClick={() => handleGenerate(AppView.EXAM_PREDICTOR)} delay={620} isPro={true} />
                <BentoItem title="Vocabulary" desc="Extract words." icon={Book} iconBg="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" onClick={() => handleGenerate(AppView.VOCABULARY_BUILDER)} delay={640} isPro={true} />
                <BentoItem title="Podcasts" desc="AI Audio." icon={Podcast} iconBg="bg-purple-50 dark:bg-purple-900/20 text-purple-600" onClick={() => handleGenerate(AppView.PODCAST)} delay={650} isPro={true} />
                <BentoItem title="Concepts" desc="Key terms." icon={Lightbulb} iconBg="bg-amber-50 dark:bg-amber-900/20 text-amber-600" onClick={() => handleGenerate(AppView.KEY_CONCEPTS)} delay={700} />
                <SpotlightCard onClick={() => handleGenerate(AppView.CHAT)} className="col-span-1 md:col-span-2 bg-gradient-brand rounded-[2.5rem] p-8 shadow-glow hover:shadow-[0_25px_50px_-15px_rgba(139,92,246,0.6)] hover:scale-[1.01] transition-all duration-500 cursor-pointer group relative flex items-center justify-between text-white animate-scale-up delay-750">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2"><MessageSquare size={28} /><h3 className="text-2xl font-bold">AI Chat Tutor</h3></div>
                        <p className="text-white/80">Ask questions about your document.</p>
                    </div>
                    <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </SpotlightCard>
            </div>
        </div>
    </div>
);

const BentoItem = ({ title, desc, icon: Icon, iconBg, onClick, delay, isPro }: any) => (
    <div
        onClick={onClick}
        className={`group bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 shadow-soft-xl hover:shadow-glow border border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 cursor-pointer animate-scale-up-fade relative overflow-hidden`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {isPro && (
            <div className="absolute top-4 right-4 bg-brand-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-glow flex items-center gap-1 z-10 animate-pulse">
                <Zap size={8} fill="currentColor" /> PRO
            </div>
        )}
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-600/5 dark:bg-brand-600/10 rounded-tl-[4rem] translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
    </div>
);