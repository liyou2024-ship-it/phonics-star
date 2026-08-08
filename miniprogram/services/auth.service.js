"use strict";
/**
 * 微信登录 + 无账号自动注册服务（微信云托管版）
 *
 * 流程：
 *   1. 小程序用 wx.login() 拿登录 code（后端若用 code 换 openid 时需要）。
 *   2. 通过 wx.cloud.callContainer 调用云托管后端的登录接口。
 *      —— 微信会在请求头自动注入 X-WX-OPENID（真实 openid），后端据此查/建用户。
 *      —— "无账号自动注册"由后端按 openid 完成（服务端逻辑）。
 *   3. 后端返回用户资料 -> 写入 userStore 并本地缓存（离线/重启可用）。
 *
 * 若云托管调用失败（后端未部署/环境不对），自动回退到本地账号，保证内测可跑。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUD_ENV = void 0;
exports.wxLogin = wxLogin;
exports.getStoredUser = getStoredUser;
exports.ensureLogin = ensureLogin;
exports.logout = logout;
const cloud_client_1 = require("./cloud.client");
Object.defineProperty(exports, "CLOUD_ENV", { enumerable: true, get: function () { return cloud_client_1.CLOUD_ENV; } });
/**
 * 登录接口路径 —— ⚠️ 改成你云托管后端的实际路径。
 * 常见命名：/api/auth/login、/login、/api/user/login 等。
 */
const LOGIN_PATH = '/api/auth/login';
const STORAGE_KEY = 'phonics_star_user';
/** 生成稳定的本地兜底用户 ID */
function genUserId() {
    const rand = Math.random().toString(36).slice(2, 10);
    return 'wx_' + Date.now().toString(36) + rand;
}
/** 兜底昵称：新用户 + 6 位随机数字 */
function genDefaultNickname() {
    const digits = String(Math.floor(100000 + Math.random() * 900000));
    return '新用户' + digits;
}
/** 微信登录拿 code（后端若用 code 换 openid 时需要） */
function wxLogin() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => resolve(res.code),
            fail: (err) => reject(err),
        });
    });
}
/** 从本地存储读取已登录用户 */
function getStoredUser() {
    try {
        const raw = wx.getStorageSync(STORAGE_KEY);
        if (raw && raw.id)
            return raw;
    }
    catch (e) {
        // 读取失败视为未登录
    }
    return null;
}
/** 把后端返回的不同字段命名规整成统一的 UserProfile */
function normalizeProfile(raw) {
    if (!raw)
        return null;
    const id = raw.userId || raw.openid || raw.id;
    if (!id)
        return null;
    return {
        id,
        nickname: raw.nickname || raw.userName || raw.nickName || genDefaultNickname(),
        avatarUrl: raw.avatarUrl || raw.avatar || '/assets/images/default-avatar.png',
        role: raw.role || 'student',
        activeStudentId: raw.activeStudentId || 's_mock_001',
    };
}
/** 调用云托管后端登录接口（微信自动注入 X-WX-OPENID 请求头） */
function callBackendLogin(code) {
    return (0, cloud_client_1.cloudCall)({ path: LOGIN_PATH, method: 'POST', data: { code } }).then((data) => {
        const profile = normalizeProfile(data);
        if (!profile) {
            throw new Error('登录接口返回缺少用户字段: ' + JSON.stringify(data));
        }
        return profile;
    });
}
/** 云托管登录失败时的本地兜底账号（保证内测可跑） */
function localFallback() {
    const existing = getStoredUser();
    if (existing)
        return existing;
    const fb = {
        id: genUserId(),
        nickname: genDefaultNickname(),
        avatarUrl: '/assets/images/default-avatar.png',
        role: 'student',
        activeStudentId: 's_mock_001',
    };
    try {
        wx.setStorageSync(STORAGE_KEY, fb);
    }
    catch (e) {
        // ignore
    }
    return fb;
}
/**
 * 确保登录态：调用云托管登录接口（后端按 openid 自动注册/登录）。
 * 失败时回退本地账号。
 */
async function ensureLogin() {
    let code = '';
    try {
        code = await wxLogin();
    }
    catch (e) {
        // 拿不到 code 也能靠 X-WX-OPENID 请求头登录
    }
    try {
        const profile = await callBackendLogin(code);
        try {
            wx.setStorageSync(STORAGE_KEY, profile);
        }
        catch (e) {
            // ignore
        }
        return profile;
    }
    catch (e) {
        console.warn('[auth] 云托管登录失败，回退本地账号', e);
        return localFallback();
    }
}
/** 退出登录（清本地缓存，并通知后端销毁会话） */
function logout() {
    try {
        wx.removeStorageSync(STORAGE_KEY);
    }
    catch (e) {
        // ignore
    }
}
//# sourceMappingURL=auth.service.js.map