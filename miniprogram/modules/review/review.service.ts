/**
 * 复习服务
 * 管理每日复习内容、间隔复习算法
 */

import { ReviewPlan, ReviewItem } from './types';
import { getTodayDate } from '../../utils/format';

/**
 * 获取今日复习计划（Mock 实现）
 */
export function getTodayReviewPlan(): ReviewPlan {
  const today = getTodayDate();
  return {
    date: today,
    items: [
      { type: 'phoneme', targetId: 'ph_s', lastReviewedAt: today, intervalDays: 1 },
      { type: 'phoneme', targetId: 'ph_a', lastReviewedAt: today, intervalDays: 1 },
      { type: 'word', targetId: 'w_cat', lastReviewedAt: today, intervalDays: 1 },
      { type: 'word', targetId: 'w_bat', lastReviewedAt: today, intervalDays: 2 },
      { type: 'lesson', targetId: 'L001', lastReviewedAt: today, intervalDays: 1 },
    ],
  };
}

/**
 * 计算下次复习间隔（基于 SM-2 简化算法）
 * 第1次: 1天, 第2次: 2天, 第3次: 4天, 第4次: 7天, 第5次: 15天, 第6次: 30天
 */
export function getNextInterval(currentInterval: number): number {
  const intervals = [1, 2, 4, 7, 15, 30];
  const idx = intervals.indexOf(currentInterval);
  if (idx >= 0 && idx < intervals.length - 1) {
    return intervals[idx + 1];
  }
  return 30;
}

/**
 * 计算今日待复习数量
 */
export function getReviewCount(): number {
  return getTodayReviewPlan().items.length;
}
