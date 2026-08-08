"use strict";
/**
 * 微信云托管共享 client
 *
 * 所有后端调用统一走 wx.cloud.callContainer：
 *   - 微信会自动在请求头注入 X-WX-OPENID（真实 openid）。
 *   - 后端据此识别当前登录用户，无需小程序自己带 token。
 *
 * 本项目 typings 未声明 wx.cloud.callContainer，故用 any 规避编译报错。
 * 约定后端返回结构：{ code: number, data?: any, message?: string }，code===0 为成功。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUD_SERVICE = exports.CLOUD_ENV = void 0;
exports.ensureCloudInit = ensureCloudInit;
exports.cloudCall = cloudCall;
/** 微信云托管环境 ID（来自云开发控制台） */
exports.CLOUD_ENV = 'prod-d0gmqqe4yc47dd703';
/**
 * 云托管「服务名称」——⚠️ 必须与云托管控制台一致！
 * 查法：云托管控制台 → 服务管理 → 服务列表 → 「服务名称」那一列。
 * 不传/传错 → 网关报 -601031 INVALID_PATH（找不到服务）。
 */
exports.CLOUD_SERVICE = 'xiaomuchi-zypd';
const cloud = wx.cloud;
/** 幂等初始化云（app.ts / 各次调用前都会尝试，重复调用安全） */
function ensureCloudInit() {
    try {
        if (cloud && cloud.init)
            cloud.init({ env: exports.CLOUD_ENV, traceUser: true });
    }
    catch (e) {
        // ignore
    }
}
/**
 * 调用云托管后端，统一处理成功/失败与业务码。
 * 成功 resolve 后端返回的 data 字段；失败 reject(Error)。
 */
function cloudCall(opts) {
    return new Promise((resolve, reject) => {
        ensureCloudInit();
        if (!cloud || typeof cloud.callContainer !== 'function') {
            reject(new Error('wx.cloud 未初始化或 callContainer 不可用'));
            return;
        }
        cloud.callContainer({
            config: { env: exports.CLOUD_ENV },
            // apiVersion:2 规避「首次失败后 callContainer 缓存 INVALID_PATH、后续不再真正发请求」的坑
            apiVersion: 2,
            path: opts.path,
            method: opts.method || 'POST',
            header: Object.assign({ 'content-type': 'application/json', 'X-WX-SERVICE': exports.CLOUD_SERVICE }, opts.header || {}),
            data: opts.data,
            success: (res) => {
                const body = res && res.data;
                if (body && typeof body === 'object' && 'code' in body) {
                    if (body.code === 0) {
                        resolve(body.data);
                    }
                    else {
                        reject(new Error(body.message || ('后端错误码 ' + body.code)));
                    }
                    return;
                }
                // 没有 code 字段时，直接把 body 当作 data 返回（兼容不同返回结构）
                resolve(body);
            },
            fail: (err) => reject(err),
        });
    });
}
//# sourceMappingURL=cloud.client.js.map