/**
 * 练习引擎
 * 管理练习会话的生命周期：创建、答题、前进、结果
 */

import { PracticeSession, PracticeQuestion, PracticeAnswer, PracticeMode } from './types';
import { getQuestions } from './question-generator';
import { eventBus } from '../../utils/event-bus';

function generateSessionId(): string {
  return `prac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

class PracticeEngine {
  private session: PracticeSession | null = null;

  /** 开始新练习会话 */
  startSession(mode: PracticeMode): PracticeSession {
    const questions = getQuestions(mode);
    const session: PracticeSession = {
      sessionId: generateSessionId(),
      mode,
      questions,
      currentIndex: 0,
      answers: [],
      startedAt: new Date().toISOString(),
      status: 'in_progress',
    };
    this.session = session;

    eventBus.emit('practice_started', {
      mode,
      sessionId: session.sessionId,
      questionCount: questions.length,
    });

    return session;
  }

  /** 获取当前题目 */
  getCurrentQuestion(): PracticeQuestion | null {
    if (!this.session || this.session.status !== 'in_progress') return null;
    return this.session.questions[this.session.currentIndex] || null;
  }

  /** 回答当前题目 */
  answerQuestion(selectedIndex: number): { correct: boolean; explanation: string } {
    if (!this.session) throw new Error('未开始练习');

    const q = this.session.questions[this.session.currentIndex];
    const correct = q.correctIndex === selectedIndex;

    const answer: PracticeAnswer = {
      questionId: q.id,
      selectedIndex,
      correct,
      timeSpent: 0,
    };
    this.session.answers.push(answer);

    eventBus.emit('practice_answered', {
      sessionId: this.session.sessionId,
      questionId: q.id,
      correct,
    });

    return { correct, explanation: q.explanation };
  }

  /** 前进到下一题，返回 false 表示已是最后一题 */
  nextQuestion(): boolean {
    if (!this.session) return false;

    const nextIndex = this.session.currentIndex + 1;
    if (nextIndex >= this.session.questions.length) {
      this.session.status = 'completed';
      eventBus.emit('practice_completed', {
        sessionId: this.session.sessionId,
        mode: this.session.mode,
        ...this.getResults(),
      });
      return false;
    }

    this.session.currentIndex = nextIndex;
    return true;
  }

  /** 获取练习结果 */
  getResults(): { total: number; correct: number; score: number; answers: PracticeAnswer[] } {
    if (!this.session) return { total: 0, correct: 0, score: 0, answers: [] };

    const total = this.session.answers.length;
    const correct = this.session.answers.filter(a => a.correct).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, score, answers: this.session.answers };
  }

  /** 获取当前会话 */
  getSession(): PracticeSession | null {
    return this.session;
  }

  /** 重置引擎 */
  reset(): void {
    this.session = null;
  }
}

export const practiceEngine = new PracticeEngine();
export { PracticeEngine };
