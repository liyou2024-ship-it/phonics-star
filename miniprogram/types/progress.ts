/**
 * 学习进度类型定义
 */

/** 课节学习状态 */
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/** 课节学习进度 */
export interface LessonProgress {
  /** 课节 ID */
  lessonId: string;
  /** 学习状态 */
  status: LessonStatus;
  /** 分数 0-100 */
  score: number;
  /** 星级 0-3 */
  stars: number;
  /** 尝试次数 */
  attempts: number;
  /** 完成时间 */
  completedAt: string | null;
  /** 薄弱音素 ID 列表 */
  weakPhonemeIds: string[];
}

/** 单元进度 */
export interface UnitProgress {
  /** 单元 ID */
  unitId: string;
  /** 完成课节数 */
  completedLessons: number;
  /** 总课节数 */
  totalLessons: number;
  /** 平均得分 */
  averageScore: number;
}

/** 阶段进度 */
export interface LevelProgress {
  /** 阶段 ID */
  levelId: string;
  /** 是否解锁 */
  unlocked: boolean;
  /** 完成百分比 0-100 */
  completionPercent: number;
  /** 获得星星数 */
  stars: number;
}

/** 用户学习进度（全局） */
export interface UserProgress {
  /** 已完成课节进度映射 */
  lessonProgressMap: Record<string, LessonProgress>;
  /** 当前课节 ID */
  currentLessonId: string;
  /** 连续学习天数 */
  streak: number;
  /** 上次学习日期 YYYY-MM-DD */
  lastStudyDate: string;
  /** 总星星数 */
  totalStars: number;
  /** 能量值 */
  energy: number;
  /** 已掌握的音素 ID */
  masteredPhonemeIds: string[];
  /** 已掌握的单词 ID */
  masteredWordIds: string[];
}

/** 复习计划 */
export interface ReviewPlan {
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 待复习的课节/单词 */
  items: ReviewItem[];
}

/** 复习项 */
export interface ReviewItem {
  /** 类型 */
  type: 'phoneme' | 'word' | 'lesson';
  /** 关联 ID */
  targetId: string;
  /** 上次复习日期 */
  lastReviewedAt: string;
  /** 复习间隔天数 */
  intervalDays: number;
}
