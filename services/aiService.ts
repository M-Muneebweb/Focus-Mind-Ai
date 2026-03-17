import { GoogleGenAI } from "@google/genai";
import { MindMapNode, Flashcard, Question, KeyConcept } from "../types";

// --- HELPERS ---

export type ProgressCallback = (provider: string, model: string) => void;

function cleanJSON(jsonString: string): string {
    if (!jsonString) return "{}";
    let clean = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    if (firstBrace === -1 && firstBracket === -1) return "{}";
    let start = 0;
    let endChar = '';
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        endChar = '}';
    } else {
        start = firstBracket;
        endChar = ']';
    }
    const end = clean.lastIndexOf(endChar);
    if (end !== -1 && end > start) {
        clean = clean.substring(start, end + 1);
    } else {
        clean = clean.substring(start);
    }
    clean = clean.replace(/,\s*([\]}])/g, '$1');
    return clean;
}

function findArrayInObject(obj: any): any[] {
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== 'object' || obj === null) return [];
    if (obj.concepts && Array.isArray(obj.concepts)) return obj.concepts;
    if (obj.keyConcepts && Array.isArray(obj.keyConcepts)) return obj.keyConcepts;
    if (obj.flashcards && Array.isArray(obj.flashcards)) return obj.flashcards;
    if (obj.cards && Array.isArray(obj.cards)) return obj.cards;
    if (obj.questions && Array.isArray(obj.questions)) return obj.questions;
    if (obj.quiz && Array.isArray(obj.quiz)) return obj.quiz;
    for (const key in obj) {
        if (Array.isArray(obj[key]) && obj[key].length > 0) return obj[key];
    }
    return [];
}

// --- SECURE PROXY CALLER ---

const generateWithFallback = async (sys: string, usr: string, cb: ProgressCallback | undefined, json: boolean = false, tier: 'free' | 'pro' = 'free'): Promise<string> => {
    if (cb) cb("AI Proxy", "Requesting...");
    
    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemPrompt: sys,
                userPrompt: usr,
                jsonMode: json,
                tier: tier
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Generation failed");
        }

        const data = await response.json();
        return data.text;
    } catch (e: any) {
        console.error("AI Generation Error:", e);
        throw new Error(e.message || "Could not generate content. Please try again later.");
    }
};

// --- MAINTAIN EXISTING EXPORTS BUT CALL PROXY ---

export const extractTopics = async (text: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    const p = `Identify the 6-8 main topics from this text for a mind map. Return JSON: {"topics": ["Topic 1", "Topic 2"]}. Text: ${text.slice(0, 50000)}`;
    const r = await generateWithFallback("Topic Extractor", p, cb, true, tier);
    try { return JSON.parse(cleanJSON(r)).topics || []; } catch { return ["Main Theme"]; }
};

export const generateTargetedMindMap = async (text: string, selectedTopics: string[], cb: any, tier: 'free' | 'pro' = 'free') => {
    const topicsStr = selectedTopics.join(", ");
    const p = `Create a nested Mind Map JSON strictly for these topics: [${topicsStr}]. Structure: {"id":"root","label":"Focus","children":[{"id":"1","label":"Topic","children":[]}]}. Text: ${text.slice(0, 80000)}`;
    const r = await generateWithFallback("Mind Map Gen", p, cb, true, tier);
    try {
        const parsed = JSON.parse(cleanJSON(r));
        if (!parsed || !parsed.id) throw new Error("Invalid structure");
        return parsed;
    } catch (e) {
        throw new Error("Failed to generate mind map data. Please try again.");
    }
};

export const generateCustomQuiz = async (text: string, count: number, difficulty: string, type: string, language: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    const safeCount = tier === 'pro' ? Math.min(count, 50) : Math.min(count, 10);
    const p = `Create ${safeCount} ${difficulty} ${type} questions in ${language}. Return JSON: { "questions": [{"id":"1","question":"Q","options":["A","B"],"correctIndex":0,"explanation":"Why?"}] }. Text: ${text.slice(0, 50000)}`;
    const r = await generateWithFallback("Quiz Gen", p, cb, true, tier);
    try {
        const parsed = JSON.parse(cleanJSON(r));
        const questions = findArrayInObject(parsed);
        if (questions.length > 0) return questions.map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9) }));
        return [];
    } catch (e) { return []; }
};

export const generateCustomFlashcards = async (text: string, count: number, difficulty: string, style: string, language: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    const safeCount = tier === 'pro' ? Math.min(count, 100) : Math.min(count, 15);
    const p = `Generate ${safeCount} ${difficulty} flashcards using a ${style} style in ${language}. Return JSON: { "flashcards": [{"id":"1","front":"Term","back":"Definition"}] }. Text: ${text.slice(0, 50000)}`;
    const r = await generateWithFallback("Flashcard Gen", p, cb, true, tier);
    try {
        const parsed = JSON.parse(cleanJSON(r));
        const cards = findArrayInObject(parsed);
        if (cards.length > 0) return cards.map((c: any) => ({ ...c, id: Math.random().toString(36).substr(2, 9), status: 'learning' }));
        return [];
    } catch (e) { return []; }
};

export const generateKeyConcepts = async (text: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    const p = `Extract 10 key concepts from the text.
  RETURN STRICT JSON.
  Format: { "concepts": [{"term": "Concept Name", "definition": "Short definition", "category": "General"}] }
  Text: ${text.slice(0, 50000)}`;

    const r = await generateWithFallback("Key Concepts", p, cb, true, tier);
    try {
        const parsed = JSON.parse(cleanJSON(r));
        const concepts = findArrayInObject(parsed);
        if (concepts.length > 0) return concepts.map((c: any) => ({ ...c, id: Math.random().toString(36).substr(2, 9) }));
        return [];
    } catch (e) { return []; }
};

export const generateSummary = async (text: string, language: string = 'English', cb: any, tier: 'free' | 'pro' = 'free') => {
    return await generateWithFallback("Summarizer", `Summarize in Markdown in ${language}:\n\n${text.slice(0, 50000)}`, cb, false, tier);
};

export const chatWithPDF = async (hist: any[], ctx: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    const last = hist[hist.length - 1].content;
    const sys = `AI Tutor. Answer strictly from context. Context: ${ctx.slice(0, 50000)}`;
    return await generateWithFallback(sys, last, cb, false, tier);
};

export const generateELI5 = async (text: string, language: string = 'English', cb: any, tier: 'free' | 'pro' = 'free') => {
    return await generateWithFallback("ELI5 Teacher", `Explain like I'm 5 in ${language}:\n\n${text.slice(0, 30000)}`, cb, false, tier);
};

export const submitErrorReport = async (error: string, userEmail: string) => {
    console.log("Submitting error report:", { error, userEmail });
    return true;
};

export const generateExamPredictions = async (text: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    if (tier !== 'pro') throw new Error("Pro feature only");
    const p = `Predict 5-7 likely exam questions from this text. For each, provide a predicted importance weight (1-10) and a brief tip on how to answer it. Return JSON: {"predictions": [{"question": "Q", "weight": 8, "tip": "Mention X and Y"}]}. Text: ${text.slice(0, 50000)}`;
    const r = await generateWithFallback("Exam Predictor", p, cb, true, tier);
    try { return JSON.parse(cleanJSON(r)).predictions || []; } catch { return []; }
};

export const generateVocabulary = async (text: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    if (tier !== 'pro') throw new Error("Pro feature only");
    const p = `Extract 10-15 challenging or domain-specific words from this text. For each, provide a definition and an example sentence. Return JSON: {"vocabulary": [{"word": "W", "definition": "D", "example": "E"}]}. Text: ${text.slice(0, 50000)}`;
    const r = await generateWithFallback("Vocab Builder", p, cb, true, tier);
    try { return JSON.parse(cleanJSON(r)).vocabulary || []; } catch { return []; }
};

// PODCAST stays direct for now because it handles binary data slightly differently 
// (or we can move it too later, but it needs VITE_GEMINI_API_KEY which we'll secure)
export const generatePodcast = async (text: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    if (tier !== 'pro') throw new Error("Pro feature only");
    if (cb) cb("Podcast Gen", "Writing script...");

    const scriptPrompt = `Create a short, engaging 1-minute educational podcast script between two hosts, Joe and Jane, explaining the core concepts of the following text. Make it easy to understand, conversational, and fun. Format exactly as:
Joe: [text]
Jane: [text]

Text: ${text.slice(0, 30000)}`;

    const script = await generateWithFallback("Podcast Writer", scriptPrompt, cb, false, tier);

    if (cb) cb("Podcast Gen", "Generating audio...");

    // For Podcast, we still need a key for the TTS. 
    // We'll tell the user to keep ONE Gemini key as VITE_ to support this, or we proxy it too.
    // Given the complexity of binary response, we'll suggest using the backend proxy for text 
    // and keep TTS direct but we'll instruct the user on how to hide it.
    
    const getApiKey = () => {
        // @ts-ignore
        return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
               // @ts-ignore
               (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) || "";
    };

    const apiKey = getApiKey();
    if (!apiKey) throw new Error("No Gemini key available for TTS. Please add VITE_GEMINI_API_KEY to your env.");

    const ai = new GoogleGenAI(apiKey);

    const response = await (ai as any).models.generateContent({
        model: "gemini-2.0-flash-preview-tts",
        contents: [{ parts: [{ text: script }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                        { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                    ]
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Failed to generate audio");

    const binaryString = atob(base64Audio);
    const pcmData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        pcmData[i] = binaryString.charCodeAt(i);
    }

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    const out = new Uint8Array(buffer);
    out.set(pcmData, 44);

    const blob = new Blob([out], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(blob);

    return { audio: audioUrl, script };
};

export const generateMnemonics = async (text: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    const p = `Extract 5-10 difficult terms or concepts from the text and generate a clever mnemonic, memory hook, or story for each to help a student remember it. 
  RETURN STRICT JSON.
  Format: { "mnemonics": [{"term": "Term", "mnemonic": "The clever memory aid", "explanation": "Why this works"}] }
  Text: ${text.slice(0, 50000)}`;

    const r = await generateWithFallback("Mnemonics Gen", p, cb, true, tier);
    try {
        const parsed = JSON.parse(cleanJSON(r));
        const mnemonics = findArrayInObject(parsed);
        if (mnemonics.length > 0) return mnemonics.map((m: any) => ({ ...m, id: Math.random().toString(36).substr(2, 9) }));
        return [];
    } catch (e) { return []; }
};

export const generateStudySchedule = async (text: string, cb: any, tier: 'free' | 'pro' = 'free') => {
    const p = `Based on the provided text, create a comprehensive 7-day study schedule broken down by specific topics. 
  RETURN STRICT JSON.
  Format: { "schedule": [{"day": 1, "topic": "Main Topic", "tasks": ["Task 1", "Task 2"]}] }
  Text: ${text.slice(0, 50000)}`;

    const r = await generateWithFallback("Schedule Gen", p, cb, true, tier);
    try {
        const parsed = JSON.parse(cleanJSON(r));
        const schedule = findArrayInObject(parsed);
        if (schedule.length > 0) return schedule.map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
        return [];
    } catch (e) { return []; }
};

// Legacy exports rerouted
export const generateMindMapData = async (text: string, d: any, cb: any) => generateTargetedMindMap(text, ["Main Themes"], cb);
export const expandTopic = async (topic: string, context: string, cb: any) => [];
export const generateFlashcards = async (text: string, count: number, cb: any) => generateCustomFlashcards(text, count, "Medium", "Standard", "English", cb);
export const generateQuiz = async (text: string, count: number, cb: any) => generateCustomQuiz(text, count, "Medium", "Multiple Choice", "English", cb);
export const interpretVoiceCommand = async (t: string, cb: any) => ({ action: 'NONE', payload: null, speech: '' });
