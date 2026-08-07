/**
 * 课程步骤引擎类型定义
 */

/** 步骤状态 */
export type StepStatus = 'not_started' | 'active' | 'completed' | 'failed';

/** 步骤执行结果 */
export interface StepResult {
  /** 是否通过 */
  passed: boolean;
  /** 得分 0-100 */
  score: number;
  /** 尝试次数 */
  attempts: number;
  /** 耗时 ms */
  duration: number;
  /** 附加数据 */
  data?: Record<string, unknown>;
}

/** 课程会话 */
export interface LessonSession {
  sessionId: string;
  lessonId: string;
  currentStepIndex: number;
  stepStates: StepState[];
  startedAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

/** 单个步骤状态 */
export interface StepState {
  stepId: string;
  status: StepStatus;
  result?: StepResult;
}

/** 步骤渲染器 Props */
export interface StepRendererProps {
  /** 步骤数据 */
  step: import('../../types').LessonStep;
  /** 课程数据 */
  lesson: import('../../types').Lesson;
  /** 步骤状态 */
  state: StepState;
  /** 完成回调 */
  onComplete: (result: StepResult) => void;
  /** 失败回调 */
  onFail?: (error: string) => void;
}

/** 步骤组件注册表 */
export interface StepComponent {
  type: string;
  component: string;  // 组件路径
}

/** 通用游戏结果 */
export interface GameResult {
  gameType: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  maxCombo: number;
  duration: number;
  completed: boolean;
  completedAt?: string;
}
