    export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  notes?: string;
  color?: string;
  isRoot?: boolean;
  collapsed?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status?: 'learning' | 'learned';
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface KeyConcept {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  SUMMARY = 'SUMMARY',
  MINDMAP = 'MINDMAP',
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ',
  KEY_CONCEPTS = 'KEY_CONCEPTS',
  CHAT = 'CHAT',
  ELI5 = 'ELI5',
  PODCAST = 'PODCAST',
  MNEMONICS = 'MNEMONICS',
  STUDY_SCHEDULE = 'STUDY_SCHEDULE',
  EXAM_PREDICTOR = 'EXAM_PREDICTOR',
  VOCABULARY_BUILDER = 'VOCABULARY_BUILDER'
}

export interface AIProviderStatus {
  provider: string;
  model: string;
  status: 'idle' | 'loading' | 'success' | 'failed';
  message?: string;
}

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (content: string, options?: { model?: string }) => Promise<{ message: { content: string } } | string>;
      };
    };
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}