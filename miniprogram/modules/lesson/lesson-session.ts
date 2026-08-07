/**
 * 课程会话管理
 * 创建、恢复、保存课程学习会话
 */

import { LessonSession, StepState } from './types';
import { storage } from '../../services/storage';
import { getLessonById } from '../../services/course';

const SESSION_PREFIX = 'lesson_session_';

/** 生成唯一 sessionId */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 创建新会话 */
export function createSession(lessonId: string): LessonSession {
  const lesson = getLessonById(lessonId);
  if (!lesson) throw new Error(`课程 ${lessonId} 不存在`);

  const stepStates: StepState[] = lesson.steps.map((step, index) => ({
    stepId: step.id,
    status: index === 0 ? 'active' : 'not_started',
  }));

  const session: LessonSession = {
    sessionId: generateSessionId(),
    lessonId,
    currentStepIndex: 0,
    stepStates,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'in_progress',
  };

  saveSession(session);
  return session;
}

/** 保存会话到本地 */
export function saveSession(session: LessonSession): void {
  session.updatedAt = new Date().toISOString();
  storage.set(`${SESSION_PREFIX}${session.lessonId}`, session);
}

/** 恢复会话 */
export function restoreSession(lessonId: string): LessonSession | null {
  return storage.get<LessonSession>(`${SESSION_PREFIX}${lessonId}`);
}

/** 清除会话 */
export function clearSession(lessonId: string): void {
  storage.remove(`${SESSION_PREFIX}${lessonId}`);
}

/** 进入下一步 */
export function advanceStep(session: LessonSession): LessonSession {
  const nextIndex = session.currentStepIndex + 1;
  if (nextIndex >= session.stepStates.length) {
    // 所有步骤完成
    session.status = 'completed';
    saveSession(session);
    return session;
  }

  // 标记当前步骤完成，下一步激活
  session.stepStates[session.currentStepIndex].status = 'completed';
  session.stepStates[nextIndex].status = 'active';
  session.currentStepIndex = nextIndex;
  saveSession(session);
  return session;
}

/** 标记当前步骤失败 */
export function failStep(session: LessonSession): LessonSession {
  session.stepStates[session.currentStepIndex].status = 'failed';
  saveSession(session);
  return session;
}

/** 重试当前步骤 */
export function retryStep(session: LessonSession): LessonSession {
  session.stepStates[session.currentStepIndex].status = 'active';
  session.stepStates[session.currentStepIndex].result = undefined;
  saveSession(session);
  return session;
}

/** 更新步骤结果 */
export function updateStepResult(
  session: LessonSession,
  stepIndex: number,
  result: { passed: boolean; score: number; attempts: number; duration: number; data?: Record<string, unknown> }
): LessonSession {
  session.stepStates[stepIndex].result = result;
  saveSession(session);
  return session;
}
