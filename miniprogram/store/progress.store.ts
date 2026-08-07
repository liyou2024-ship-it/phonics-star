/**
 * 学习进度状态管理
 */

import { UserProgress, LessonProgress } from '../types';
import * as progressService from '../services/progress';

let state: UserProgress = progressService.getProgress();

const listeners: Set<() => void> = new Set();

function notify(): void {
  listeners.forEach(fn => fn());
}

export const progressStore = {
  getState(): Readonly<UserProgress> {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** 重新从存储加载 */
  reload(): void {
    state = progressService.getProgress();
    notify();
  },

  /** 获取课节进度 */
  getLessonProgress(lessonId: string): LessonProgress | null {
    return state.lessonProgressMap[lessonId] || null;
  },

  /** 更新课节进度 */
  updateLessonProgress(lessonId: string, update: Partial<LessonProgress>): void {
    progressService.updateLessonProgress(lessonId, update);
    this.reload();
  },

  /** 完成课节 */
  completeLesson(lessonId: string, stars: number, score: number): void {
    progressService.completeLesson(lessonId, stars, score);
    this.reload();
  },

  /** 判断课节是否已完成 */
  isLessonCompleted(lessonId: string): boolean {
    return state.lessonProgressMap[lessonId]?.status === 'completed';
  },

  /** 判断课节是否解锁 */
  isLessonUnlocked(lessonId: string): boolean {
    const lp = state.lessonProgressMap[lessonId];
    return lp?.status === 'available' || lp?.status === 'in_progress';
  },

  /** 获取课程完成率 */
  getCompletionRate(): number {
    const total = Object.keys(state.lessonProgressMap).length;
    if (total === 0) return 0;
    const completed = Object.values(state.lessonProgressMap)
      .filter(lp => lp.status === 'completed').length;
    return Math.round((completed / total) * 100);
  },
};
