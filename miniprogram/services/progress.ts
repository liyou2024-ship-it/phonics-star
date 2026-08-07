/**
 * 学习进度服务
 * 管理用户学习进度的持久化
 */

import { storage } from './storage';
import { UserProgress, LessonProgress } from '../types';
import { getTodayDate } from '../utils/format';

const STORAGE_KEY = 'user_progress';

/** 默认进度 */
function getDefaultProgress(): UserProgress {
  return {
    lessonProgressMap: {},
    currentLessonId: 'L001',
    streak: 0,
    lastStudyDate: '',
    totalStars: 0,
    energy: 100,
    masteredPhonemeIds: [],
    masteredWordIds: [],
  };
}

/** 获取用户进度 */
export function getProgress(): UserProgress {
  const saved = storage.get<UserProgress>(STORAGE_KEY);
  return saved ? { ...getDefaultProgress(), ...saved } : getDefaultProgress();
}

/** 保存用户进度 */
export function saveProgress(progress: UserProgress): void {
  storage.set(STORAGE_KEY, progress);
}

/** 获取课节进度 */
export function getLessonProgress(lessonId: string): LessonProgress | null {
  const progress = getProgress();
  return progress.lessonProgressMap[lessonId] || null;
}

/** 更新课节进度 */
export function updateLessonProgress(
  lessonId: string,
  update: Partial<LessonProgress>
): void {
  const progress = getProgress();
  const current: LessonProgress = progress.lessonProgressMap[lessonId] || {
    lessonId,
    status: 'available',
    score: 0,
    stars: 0,
    attempts: 0,
    completedAt: null,
    weakPhonemeIds: [],
  };

  progress.lessonProgressMap[lessonId] = { ...current, ...update };
  saveProgress(progress);
}

/** 完成课节 */
export function completeLesson(
  lessonId: string,
  stars: number,
  score: number,
  weakPhonemeIds: string[] = []
): void {
  const progress = getProgress();
  const today = getTodayDate();

  // 更新连续学习天数
  if (progress.lastStudyDate !== today) {
    const yesterday = getYesterdayDate();
    if (progress.lastStudyDate === yesterday) {
      progress.streak += 1;
    } else {
      progress.streak = 1;
    }
    progress.lastStudyDate = today;
  }

  // 更新课节进度
  progress.lessonProgressMap[lessonId] = {
    lessonId,
    status: 'completed',
    score,
    stars,
    attempts: (progress.lessonProgressMap[lessonId]?.attempts ?? 0) + 1,
    completedAt: new Date().toISOString(),
    weakPhonemeIds,
  };

  // 更新总星星
  progress.totalStars += stars;

  // 自动解锁下一课
  // （简化逻辑：在课程序列中查找下一节）
  const allLessons = require('../data/lessons.json');
  const currentIdx = allLessons.findIndex((l: { id: string }) => l.id === lessonId);
  if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
    const nextLessonId = allLessons[currentIdx + 1].id;
    if (!progress.lessonProgressMap[nextLessonId]) {
      progress.lessonProgressMap[nextLessonId] = {
        lessonId: nextLessonId,
        status: 'available',
        score: 0,
        stars: 0,
        attempts: 0,
        completedAt: null,
        weakPhonemeIds: [],
      };
    }
    progress.currentLessonId = nextLessonId;
  }

  saveProgress(progress);
}

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
