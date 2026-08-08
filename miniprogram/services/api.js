"use strict";
/**
 * API 服务
 * 当前使用 Mock 数据，后续对接真实后端
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
/**
 * Mock 请求封装
 * 模拟网络延迟，返回 Mock 数据
 */
async function mockRequest(data, delayMs = 300) {
    return new Promise(resolve => {
        setTimeout(() => resolve(data), delayMs);
    });
}
/** 通用请求方法 */
exports.api = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async get(_url, _params) {
        // TODO: 对接真实后端 API
        throw new Error('API 尚未接入后端，请使用 Mock 数据');
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async post(_url, _data) {
        throw new Error('API 尚未接入后端，请使用 Mock 数据');
    },
};
//# sourceMappingURL=api.js.map