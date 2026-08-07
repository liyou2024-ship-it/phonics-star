/**
 * 语音相关类型定义
 */

/** 录音状态 */
export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

/** 录音结果 */
export interface RecorderResult {
  /** 临时文件路径 */
  tempFilePath: string;
  /** 录音时长(ms) */
  duration: number;
  /** 文件大小(bytes) */
  fileSize: number;
}

/** 录音模块接口（由 wx.getRecorderManager 实现） */
export interface IRecorder {
  /** 当前状态 */
  status: RecorderStatus;
  /** 请求录音权限 */
  requestPermission(): Promise<boolean>;
  /** 开始录音 */
  start(): Promise<void>;
  /** 停止录音 */
  stop(): Promise<RecorderResult>;
  /** 释放资源 */
  dispose(): void;
}

/** 音素评测结果 */
export interface PhonemeResult {
  /** 音素 ID */
  phonemeId: string;
  /** 音素符号 */
  symbol: string;
  /** 准确度 0-100 */
  accuracy: number;
  /** 是否达标 */
  passed: boolean;
  /** 反馈文字 */
  feedback: string;
}

/** 发音评测完整结果 */
export interface SpeechEvaluationResult {
  /** 综合得分 0-100 */
  overallScore: number;
  /** 完整度得分 */
  completenessScore: number;
  /** 流利度得分 */
  fluencyScore: number;
  /** 准确度得分 */
  accuracyScore: number;
  /** 各音素评测详情 */
  phonemeResults: PhonemeResult[];
  /** 总体反馈 */
  feedback: string;
}

/** 语音评测器接口 */
export interface ISpeechEvaluator {
  /** 评测音频 */
  evaluate(audioPath: string, targetText: string): Promise<SpeechEvaluationResult>;
  /** 获取音素评测结果 */
  getPhonemeResults(): PhonemeResult[];
}

/** 音频播放器接口 */
export interface IAudioPlayer {
  /** 播放音频 */
  play(src: string): Promise<void>;
  /** 暂停 */
  pause(): void;
  /** 停止 */
  stop(): void;
  /** 是否正在播放 */
  isPlaying(): boolean;
}
