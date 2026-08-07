/**
 * 课程体系类型定义
 */

/** 课程阶段（如“字母森林”） */
export interface Level {
  /** 唯一标识 */
  id: string;
  /** 阶段名称 */
  name: string;
  /** 阶段图标 */
  icon: string;
  /** 排序序号 */
  order: number;
  /** 阶段描述 */
  description: string;
  /** 包含的单元 ID 列表 */
  unitIds: string[];
  /** 是否锁定（需完成前置阶段） */
  locked: boolean;
}

/** 课程单元 */
export interface Unit {
  /** 唯一标识 */
  id: string;
  /** 单元标题 */
  title: string;
  /** 所属阶段 ID */
  levelId: string;
  /** 排序序号 */
  order: number;
  /** 单元目标描述 */
  objectives: string;
  /** 包含的课节 ID 列表 */
  lessonIds: string[];
}

/** 课时步骤类型 */
export type LessonStepType =
  | 'phoneme_intro'      // 发音认识
  | 'sound_discrimination' // 听音选择
  | 'phoneme_blending'   // 拼读合成
  | 'word_segmenting'    // 单词拆音
  | 'pronunciation'      // 跟读
  | 'mini_game'          // 小游戏
  | 'decodable_reading'  // 可解码阅读
  | 'lesson_reward';     // 课程奖励

/** 课时步骤 */
export interface LessonStep {
  /** 步骤 ID */
  id: string;
  /** 步骤类型 */
  type: LessonStepType;
  /** 步骤说明文字 */
  instruction: string;
  /** 步骤内容（JSON 配置数据，由具体步骤组件解析） */
  content: Record<string, unknown>;
  /** 完成条件描述 */
  completionRule: string;
}

/** 课时 */
export interface Lesson {
  /** 唯一标识 */
  id: string;
  /** 所属单元 ID */
  unitId: string;
  /** 课时标题 */
  title: string;
  /** 学习目标 */
  objectives: string;
  /** 目标音素 ID 列表 */
  targetPhonemeIds: string[];
  /** 目标单词 ID 列表 */
  targetWordIds: string[];
  /** 课时步骤 */
  steps: LessonStep[];
  /** 奖励配置 */
  reward: {
    baseStars: number;
    bonusBadgeId?: string;
    energyReward: number;
  };
  /** 前置课节 ID 列表（需先完成） */
  prerequisiteLessonIds: string[];
}

/** 可解码读物 */
export interface DecodableReader {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 文本句子列表 */
  sentences: string[];
  /** 使用的拼读规则 */
  rules: string[];
  /** 目标单词 ID */
  targetWordIds: string[];
  /** 推荐学习阶段 ID */
  recommendedLevelId: string;
  /** 阅读难度 1-5 */
  difficulty: number;
}
