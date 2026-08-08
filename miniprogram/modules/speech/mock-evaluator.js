"use strict";
/**
 * Mock 语音评测器
 * 不接真实第三方服务，返回模拟评测结果
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEvaluator = void 0;
exports.getMockEvaluator = getMockEvaluator;
const random_1 = require("../../utils/random");
class MockEvaluator {
    constructor() {
        this.lastResults = [];
    }
    /**
     * 模拟评测一段音频
     * @param _audioPath 音频文件路径（mock 中不使用）
     * @param targetText 目标文本
     */
    async evaluate(_audioPath, targetText) {
        // 模拟网络延迟
        await delay(800 + Math.random() * 1200);
        // 模拟得分（大部分情况偏高，模拟孩子得到鼓励）
        const overallScore = (0, random_1.randomInt)(75, 98);
        const completenessScore = (0, random_1.randomInt)(70, 100);
        const fluencyScore = (0, random_1.randomInt)(65, 95);
        const accuracyScore = (0, random_1.randomInt)(70, 98);
        // 根据目标文本模拟音素结果
        const mockPhonemes = [
            { phonemeId: 'ph_s', symbol: '/s/', accuracy: (0, random_1.randomInt)(60, 100), passed: true },
            { phonemeId: 'ph_a', symbol: '/æ/', accuracy: (0, random_1.randomInt)(65, 100), passed: true },
            { phonemeId: 'ph_t', symbol: '/t/', accuracy: (0, random_1.randomInt)(55, 100), passed: Math.random() > 0.3 },
        ];
        const phonemeResults = mockPhonemes.map(p => ({
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
        let feedback;
        if (overallScore >= 90) {
            feedback = '太棒了！发音非常标准！🌟';
        }
        else if (overallScore >= 75) {
            feedback = '很好！再练一下就更完美了！👍';
        }
        else {
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
    getPhonemeResults() {
        return this.lastResults;
    }
}
exports.MockEvaluator = MockEvaluator;
/** 单例 */
let evaluatorInstance = null;
function getMockEvaluator() {
    if (!evaluatorInstance) {
        evaluatorInstance = new MockEvaluator();
    }
    return evaluatorInstance;
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=mock-evaluator.js.map