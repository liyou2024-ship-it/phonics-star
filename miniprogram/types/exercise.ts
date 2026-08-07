/**
 * 练习题类型定义
 */

/** 练习题类型 */
export type ExerciseType =
  | 'sound_to_letter'        // 听音选字母
  | 'letter_to_sound'        // 看字母选发音
  | 'phoneme_blending'       // 音素合成（拖动拼词）
  | 'word_segmenting'        // 单词拆音
  | 'word_family_match'      // 词族配对
  | 'spelling'               // 听音拼写
  | 'reading_comprehension'  // 阅读理解
  | 'pronunciation_eval';    // 发音评测

/** 练习题选项 */
export interface ExerciseOption {
  /** 选项 ID */
  id: string;
  /** 选项文本 */
  text: string;
  /** 选项图片 */
  imageUrl?: string;
  /** 选项音频 */
  audioUrl?: string;
  /** 是否正确 */
  isCorrect: boolean;
}

/** 练习题 */
export interface Exercise {
  /** 唯一标识 */
  id: string;
  /** 题目类型 */
  type: ExerciseType;
  /** 题目提示文字 */
  prompt: string;
  /** 题目音频 */
  audioUrl: string;
  /** 选项列表 */
  options: ExerciseOption[];
  /** 正确答案 ID（用于简单判定） */
  answer: string;
  /** 题目解析 */
  explanation: string;
  /** 难度 1-3 */
  difficulty: number;
}

/** 练习会话 */
export interface PracticeSession {
  /** 会话 ID */
  id: string;
  /** 练习类型 */
  type: ExerciseType;
  /** 题目列表 */
  exerciseIds: string[];
  /** 当前题目索引 */
  currentIndex: number;
  /** 得分 */
  score: number;
  /** 答题记录 */
  answers: PracticeAnswer[];
}

/** 答题记录 */
export interface PracticeAnswer {
  /** 题目 ID */
  exerciseId: string;
  /** 用户选择 */
  selectedOptionId: string;
  /** 是否正确 */
  correct: boolean;
  /** 耗时(ms) */
  timeSpent: number;
}
