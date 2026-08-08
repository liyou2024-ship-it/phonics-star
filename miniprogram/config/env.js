"use strict";
/**
 * 环境配置
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.env = {
    /** 是否开发环境 */
    isDev: true,
    /** 是否使用 Mock 数据 */
    useMock: true,
    /** API 基础地址（后续对接后端时使用） */
    apiBaseUrl: 'https://api.phonics-star.example.com',
    /** 语音评测模式: 'mock' | 'tencent-asr' */
    speechEvalMode: 'mock',
};
//# sourceMappingURL=env.js.map