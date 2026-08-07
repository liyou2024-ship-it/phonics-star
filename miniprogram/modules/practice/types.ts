/**
 * 练习模块类型定义
 */

export type PracticeMode = 'listen' | 'spell' | 'family' | 'error_review';

export interface PracticeQuestion {
  id: string;
  type: PracticeMode;
  prompt: string;
  audioUrl?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PracticeSession {
  sessionId: string;
  mode: PracticeMode;
  questions: PracticeQuestion[];
  currentIndex: number;
  answers: PracticeAnswer[];
  startedAt: string;
  status: 'in_progress' | 'completed';
}

export interface PracticeAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeSpent: number;
}
