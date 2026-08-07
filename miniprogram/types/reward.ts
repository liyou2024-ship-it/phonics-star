/**
 * 奖励系统类型定义
 */

/** 徽章 */
export interface Badge {
  /** 唯一标识 */
  id: string;
  /** 徽章名称 */
  name: string;
  /** 徽章图标 */
  icon: string;
  /** 获得条件描述 */
  description: string;
  /** 类别 */
  category: 'milestone' | 'skill' | 'streak' | 'special';
}

/** 用户获得的徽章 */
export interface UserBadge {
  /** 徽章 ID */
  badgeId: string;
  /** 获得时间 */
  earnedAt: string;
}

/** 收集卡牌 */
export interface CollectibleCard {
  /** 卡牌 ID */
  id: string;
  /** 卡牌名称 */
  name: string;
  /** 卡牌图片 */
  imageUrl: string;
  /** 所属音素 ID */
  phonemeId: string;
  /** 是否已收集 */
  collected: boolean;
}

/** 奖励类型 */
export type RewardType =
  | 'stars'
  | 'energy'
  | 'badge'
  | 'card'
  | 'pet_food';

/** 单次奖励 */
export interface Reward {
  /** 奖励类型 */
  type: RewardType;
  /** 数量 */
  amount: number;
  /** 关联 ID（如 badgeId） */
  targetId?: string;
}

/** 宠物/角色成长 */
export interface PetGrowth {
  /** 宠物 ID */
  petId: string;
  /** 宠物名称 */
  name: string;
  /** 宠物图标 */
  emoji: string;
  /** 当前等级 */
  level: number;
  /** 经验值 */
  experience: number;
  /** 升级所需经验 */
  experienceToNextLevel: number;
  /** 解锁的课程数 */
  unlockedLessonsCount: number;
}
