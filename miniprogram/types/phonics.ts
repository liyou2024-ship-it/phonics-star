/**
 * 自然拼读核心类型定义
 * 包含音素、字素、单词的数据结构
 */

/** 音素（最小的发音单位） */
export interface Phoneme {
  /** 唯一标识，如 "ph_s" */
  id: string;
  /** 音标符号，如 "/s/" */
  symbol: string;
  /** 显示名称，如 "字母音 S" */
  displayName: string;
  /** 分类: vowel(元音) | consonant(辅音) | digraph(组合音) */
  category: 'vowel' | 'consonant' | 'digraph';
  /** 标准发音音频地址 */
  audioUrl: string;
  /** 口型提示文字 */
  mouthTip: string;
  /** 关联的示例单词 ID 列表 */
  exampleWordIds: string[];
}

/** 字素（字母或字母组合，对应一个或多个音素） */
export interface Grapheme {
  /** 唯一标识，如 "gr_s" */
  id: string;
  /** 字母文本，如 "s", "sh" */
  text: string;
  /** 对应的音素 ID 列表 */
  phonemeIds: string[];
  /** 拼读规则描述，如 "CVC 首辅音" */
  rule: string;
  /** 示例词列表 */
  examples: string[];
}

/** 字素到音素的映射（单词级别） */
export interface GraphemeMapping {
  /** 字素 ID */
  graphemeId: string;
  /** 在单词中的位置 [start, end) */
  position: [number, number];
}

/** 单词 */
export interface Word {
  /** 唯一标识，如 "w_cat" */
  id: string;
  /** 单词文本 */
  text: string;
  /** 中文释义 */
  meaning: string;
  /** 配图地址 */
  imageUrl: string;
  /** 发音音频地址 */
  audioUrl: string;
  /** 包含的音素 ID 列表（按顺序） */
  phonemeIds: string[];
  /** 字素到音素映射 */
  graphemeMappings: GraphemeMapping[];
  /** 所属词族 ID，如 "wf_at" */
  familyId: string | null;
  /** 难度等级 1-5 */
  difficulty: number;
  /** 是否可解码（完全符合已学规则） */
  isDecodable: boolean;
  /** 不规则部分的描述（如果是可解码词则为空） */
  irregularParts: string;
}

/** 词族 */
export interface WordFamily {
  /** 唯一标识，如 "wf_at" */
  id: string;
  /** 词族名，如 "-at" */
  name: string;
  /** 所属拼读规则 */
  rule: string;
  /** 词族单词 ID 列表 */
  wordIds: string[];
  /** 难度 */
  difficulty: number;
}

/** 音素类别枚举 */
export const PhonemeCategory = {
  VOWEL: 'vowel' as const,
  CONSONANT: 'consonant' as const,
  DIGRAPH: 'digraph' as const,
};
