/**
 * 奖励服务
 * 管理徽章检查、奖励发放逻辑
 */

import badgesData from '../../data/badges.json';
import { Badge } from './types';

/**
 * 获取所有可用徽章
 */
export function getAllBadges(): Badge[] {
  return badgesData as Badge[];
}

/**
 * 根据 ID 获取徽章
 */
export function getBadgeById(id: string): Badge | undefined {
  return (badgesData as Badge[]).find(b => b.id === id);
}

/**
 * 检查徽章条件是否满足（Mock 实现，后续接入真实逻辑）
 */
export function checkBadgeCondition(
  badge: Badge,
  context: Record<string, number>
): boolean {
  // 简单的条件检查：context 中对应 key 达到 1 即可
  return (context[badge.id] ?? 0) >= 1;
}

/**
 * 计算完成任务后的能量奖励
 */
export function calculateEnergyReward(baseEnergy: number, streakMultiplier: number): number {
  return Math.floor(baseEnergy * (1 + streakMultiplier * 0.1));
}
