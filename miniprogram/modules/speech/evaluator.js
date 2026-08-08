"use strict";
/**
 * 语音评测器入口
 * 当前使用 MockEvaluator，后续可切换为真实第三方服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecorder = exports.MockEvaluator = void 0;
exports.getEvaluator = getEvaluator;
const mock_evaluator_1 = require("./mock-evaluator");
// 真实评测器接口（预留，待接入腾讯云 ASR 或其他服务）
class RealEvaluator {
    async evaluate(_audioPath, _targetText) {
        throw new Error('真实语音评测服务尚未接入');
    }
    getPhonemeResults() { return []; }
}
/**
 * 获取当前评测器
 * TODO: 根据 feature-flags 或环境配置切换 Mock/Real
 */
function getEvaluator() {
    // 当前始终使用 Mock
    return (0, mock_evaluator_1.getMockEvaluator)();
}
var mock_evaluator_2 = require("./mock-evaluator");
Object.defineProperty(exports, "MockEvaluator", { enumerable: true, get: function () { return mock_evaluator_2.MockEvaluator; } });
var recorder_1 = require("./recorder");
Object.defineProperty(exports, "getRecorder", { enumerable: true, get: function () { return recorder_1.getRecorder; } });
//# sourceMappingURL=evaluator.js.map