/**
 * 语音评测器入口
 * 当前使用 MockEvaluator，后续可切换为真实第三方服务
 */

import { ISpeechEvaluator, SpeechEvaluationResult } from './types';
import { getMockEvaluator } from './mock-evaluator';

// 真实评测器接口（预留，待接入腾讯云 ASR 或其他服务）
class RealEvaluator implements ISpeechEvaluator {
  async evaluate(_audioPath: string, _targetText: string): Promise<SpeechEvaluationResult> {
    throw new Error('真实语音评测服务尚未接入');
  }
  getPhonemeResults() { return []; }
}

/**
 * 获取当前评测器
 * TODO: 根据 feature-flags 或环境配置切换 Mock/Real
 */
export function getEvaluator(): ISpeechEvaluator {
  // 当前始终使用 Mock
  return getMockEvaluator();
}

export { MockEvaluator } from './mock-evaluator';
export { getRecorder } from './recorder';
