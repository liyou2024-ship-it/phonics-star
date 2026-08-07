/**
 * 课程引擎
 * 课程步骤状态机，管理步骤流转
 */

import { LessonSession, StepState, StepResult } from './types';
import { Lesson } from '../../types';
import {
  createSession,
  restoreSession,
  saveSession,
  advanceStep,
  retryStep,
  updateStepResult,
} from './lesson-session';
import { getLessonById } from '../../services/course';
import { eventBus } from '../../utils/event-bus';

/** 引擎状态 */
export interface EngineState {
  lesson: Lesson | null;
  session: LessonSession | null;
  currentStepIndex: number;
  currentStepState: StepState | null;
  loading: boolean;
  error: string;
}

class LessonEngine {
  private state: EngineState = {
    lesson: null,
    session: null,
    currentStepIndex: 0,
    currentStepState: null,
    loading: false,
    error: '',
  };

  private listeners: Set<(state: EngineState) => void> = new Set();

  getState(): EngineState {
    return { ...this.state };
  }

  subscribe(listener: (state: EngineState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  private setState(partial: Partial<EngineState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  /** 加载课程并创建/恢复会话 */
  loadLesson(lessonId: string): void {
    this.setState({ loading: true, error: '' });

    try {
      const lesson = getLessonById(lessonId);
      if (!lesson) {
        this.setState({ loading: false, error: '课程不存在' });
        return;
      }

      // 尝试恢复已有会话
      let session = restoreSession(lessonId);

      if (!session || session.status === 'completed') {
        // 创建新会话（已完成也重新开始）
        session = createSession(lessonId);
      }

      const currentStepState = session.stepStates[session.currentStepIndex] || null;

      this.setState({
        lesson,
        session,
        currentStepIndex: session.currentStepIndex,
        currentStepState,
        loading: false,
      });

      eventBus.emit('lesson_started', {
        lessonId,
        sessionId: session.sessionId,
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: (err as Error).message || '加载课程失败',
      });
    }
  }

  /** 完成当前步骤，进入下一步 */
  completeStep(result: StepResult): void {
    const { session, currentStepIndex } = this.state;
    if (!session) return;

    // 保存步骤结果
    const updated = updateStepResult(session, currentStepIndex, {
      ...result,
      attempts: result.attempts || 1,
      duration: result.duration || 0,
    });

    // 记录步骤完成事件
    eventBus.emit('lesson_step_completed', {
      lessonId: updated.lessonId,
      sessionId: updated.sessionId,
      stepIndex: currentStepIndex,
      result,
    });

    // 进入下一步
    const nextSession = advanceStep(updated);

    if (nextSession.status === 'completed') {
      // 课程完成
      eventBus.emit('lesson_completed', {
        lessonId: nextSession.lessonId,
        sessionId: nextSession.sessionId,
        stepStates: nextSession.stepStates,
      });
    }

    this.setState({
      session: nextSession,
      currentStepIndex: nextSession.currentStepIndex,
      currentStepState: nextSession.stepStates[nextSession.currentStepIndex] || null,
    });
  }

  /** 重试当前步骤 */
  retryCurrentStep(): void {
    const { session } = this.state;
    if (!session) return;

    const updated = retryStep(session);
    this.setState({
      session: updated,
      currentStepState: updated.stepStates[updated.currentStepIndex],
    });
  }

  /** 获取当前步骤的组件路径 */
  getCurrentStepComponent(): string | null {
    const { lesson, currentStepIndex } = this.state;
    if (!lesson || !lesson.steps[currentStepIndex]) return null;

    const step = lesson.steps[currentStepIndex];
    const { getStepComponent } = require('./step-registry');
    return getStepComponent(step.type);
  }

  /** 重置引擎 */
  reset(): void {
    this.state = {
      lesson: null,
      session: null,
      currentStepIndex: 0,
      currentStepState: null,
      loading: false,
      error: '',
    };
    this.notify();
  }
}

/** 单例 */
let engineInstance: LessonEngine | null = null;

export function getLessonEngine(): LessonEngine {
  if (!engineInstance) engineInstance = new LessonEngine();
  return engineInstance;
}

export { LessonEngine };
