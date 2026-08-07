/**
 * Mock 语音评测器
 * 不接真实第三方服务，返回模拟评测结果
 */

import { ISpeechEvaluator, SpeechEvaluationResult, PhonemeResult } from './types';
import { randomInt } from '../../utils/random';

export class MockEvaluator implements ISpeechEvaluator {
  private lastResults: PhonemeResult[] = [];

  /**
   * 模拟评测一段音频
   * @param _audioPath 音频文件路径（mock 中不使用）
   * @param targetText 目标文本
   */
  async evaluate(_audioPath: string, targetText: string): Promise<SpeechEvaluationResult> {
    // 模拟网络延迟
    await delay(800 + Math.random() * 1200);

    // 模拟得分（大部分情况偏高，模拟孩子得到鼓励）
    const overallScore = randomInt(75, 98);
    const completenessScore = randomInt(70, 100);
    const fluencyScore = randomInt(65, 95);
    const accuracyScore = randomInt(70, 98);

    // 根据目标文本模拟音素结果
    const mockPhonemes = [
      { phonemeId: 'ph_s', symbol: '/s/', accuracy: randomInt(60, 100), passed: true },
      { phonemeId: 'ph_a', symbol: '/æ/', accuracy: randomInt(65, 100), passed: true },
      { phonemeId: 'ph_t', symbol: '/t/', accuracy: randomInt(55, 100), passed: Math.random() > 0.3 },
    ];

    const phonemeResults: PhonemeResult[] = mockPhonemes.map(p => ({
      phonemeId: p.phonemeId,
      symbol: p.symbol,
      accuracy: p.accuracy,
      passed: p.passed,
      feedback: p.passed
        ? `${p.symbol} 发音准确！`
        : `再练习一下 ${p.symbol} 的发音`,
    }));

    this.lastResults = phonemeResults;

    // 生成儿童友好的反馈
    let feedback: string;
    if (overallScore >= 90) {
      feedback = '太棒了！发音非常标准！🌟';
    } else if (overallScore >= 75) {
      feedback = '很好！再练一下就更完美了！👍';
    } else {
      feedback = '不错，继续加油！跟着示范再读一遍吧！💪';
    }

    return {
      overallScore,
      completenessScore,
      fluencyScore,
      accuracyScore,
      phonemeResults,
      feedback,
    };
  }

  /**
   * 获取最近一次评测的音素结果
   */
  getPhonemeResults(): PhonemeResult[] {
    return this.lastResults;
  }
}

/** 单例 */
let evaluatorInstance: MockEvaluator | null = null;

export function getMockEvaluator(): MockEvaluator {
  if (!evaluatorInstance) {
    evaluatorInstance = new MockEvaluator();
  }
  return evaluatorInstance;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
