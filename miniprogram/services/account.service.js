"use strict";
/**
 * 账户管理服务 client（微信云托管版）
 *
 * 涵盖：退出登录、修改密码、绑定手机号、注销账号。
 * 所有操作均走 wx.cloud.callContainer（微信自动注入 X-WX-OPENID 标识当前用户）。
 *
 * 路径均为可配置常量，⚠️ 需与你的后端路由对齐后再 build 验证。
 * 约定后端返回 { code:0, data?, message? }，code!==0 视为失败。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = logout;
exports.changePassword = changePassword;
exports.bindPhone = bindPhone;
exports.deleteAccount = deleteAccount;
exports.getAccountInfo = getAccountInfo;
const cloud_client_1 = require("./cloud.client");
const auth_service_1 = require("./auth.service");
/** 后端路由路径 —— ⚠️ 改成你云托管后端的实际路径 */
const PATH = {
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/user/change-password',
    BIND_PHONE: '/api/user/bind-phone',
    DELETE_ACCOUNT: '/api/user/delete',
    ACCOUNT_INFO: '/api/user/info',
};
/** 退出登录：先通知后端销毁会话，再清本地缓存 */
async function logout() {
    try {
        await (0, cloud_client_1.cloudCall)({ path: PATH.LOGOUT, method: 'POST' });
    }
    catch (e) {
        // 后端失败也允许本地退出（保证用户能登出）
        console.warn('[account] 后端登出失败，仍清除本地登录态', e);
    }
    (0, auth_service_1.logout)();
}
/** 修改密码 */
function changePassword(oldPassword, newPassword) {
    return (0, cloud_client_1.cloudCall)({
        path: PATH.CHANGE_PASSWORD,
        method: 'POST',
        data: { oldPassword, newPassword },
    }).then(() => undefined);
}
/**
 * 绑定手机号。
 * @param phoneCode 来自 <button open-type="getPhoneNumber"> 回调的 e.detail.code，
 *                 后端用该 code 向微信换取真实手机号。
 */
function bindPhone(phoneCode) {
    return (0, cloud_client_1.cloudCall)({
        path: PATH.BIND_PHONE,
        method: 'POST',
        data: { code: phoneCode },
    });
}
/** 注销账号（永久删除/停用当前账户，不可恢复） */
function deleteAccount() {
    return (0, cloud_client_1.cloudCall)({
        path: PATH.DELETE_ACCOUNT,
        method: 'POST',
    }).then(() => undefined);
}
/** 获取账户资料（手机号等绑定信息），用于页面展示 */
function getAccountInfo() {
    return (0, cloud_client_1.cloudCall)({
        path: PATH.ACCOUNT_INFO,
        method: 'GET',
    });
}
//# sourceMappingURL=account.service.js.map