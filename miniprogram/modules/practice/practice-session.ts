/**
 * 练习会话持久化
 * 保存、恢复、清除练习会话到本地存储
 */

import { PracticeSession, PracticeMode } from './types';
import { storage } from '../../services/storage';

const SESSION_PREFIX = 'practice_session_';

function key(mode: PracticeMode): string {
  return `${SESSION_PREFIX}${mode}`;
}

/** 保存会话 */
export function saveSession(session: PracticeSession): void {
  storage.set(key(session.mode), session);
}

/** 恢复会话，不存在返回 null */
export function restoreSession(mode: PracticeMode): PracticeSession | null {
  return storage.get<PracticeSession>(key(mode));
}

/** 清除指定模式的会话 */
export function clearSession(mode: PracticeMode): void {
  storage.remove(key(mode));
}
