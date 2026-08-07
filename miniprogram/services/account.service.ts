/**
 * 账户管理服务 client（微信云托管版）
 *
 * 涵盖：退出登录、修改密码、绑定手机号、注销账号。
 * 所有操作均走 wx.cloud.callContainer（微信自动注入 X-WX-OPENID 标识当前用户）。
 *
 * 路径均为可配置常量，⚠️ 需与你的后端路由对齐后再 build 验证。
 * 约定后端返回 { code:0, data?, message? }，code!==0 视为失败。
 */

import { cloudCall } from './cloud.client';
import { logout as clearLocalLogin } from './auth.service';

/** 后端路由路径 —— ⚠️ 改成你云托管后端的实际路径 */
const PATH = {
  LOGOUT: '/api/auth/logout',
  CHANGE_PASSWORD: '/api/user/change-password',
  BIND_PHONE: '/api/user/bind-phone',
  DELETE_ACCOUNT: '/api/user/delete',
  ACCOUNT_INFO: '/api/user/info',
} as const;

/** 账户资料（用于展示手机号等绑定信息） */
export interface AccountInfo {
  phone?: string;
  bindPhone?: boolean;
  [key: string]: any;
}

/** 退出登录：先通知后端销毁会话，再清本地缓存 */
export async function logout(): Promise<void> {
  try {
    await cloudCall({ path: PATH.LOGOUT, method: 'POST' });
  } catch (e) {
    // 后端失败也允许本地退出（保证用户能登出）
    console.warn('[account] 后端登出失败，仍清除本地登录态', e);
  }
  clearLocalLogin();
}

/** 修改密码 */
export function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  return cloudCall({
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
export function bindPhone(phoneCode: string): Promise<AccountInfo> {
  return cloudCall<AccountInfo>({
    path: PATH.BIND_PHONE,
    method: 'POST',
    data: { code: phoneCode },
  });
}

/** 注销账号（永久删除/停用当前账户，不可恢复） */
export function deleteAccount(): Promise<void> {
  return cloudCall({
    path: PATH.DELETE_ACCOUNT,
    method: 'POST',
  }).then(() => undefined);
}

/** 获取账户资料（手机号等绑定信息），用于页面展示 */
export function getAccountInfo(): Promise<AccountInfo> {
  return cloudCall<AccountInfo>({
    path: PATH.ACCOUNT_INFO,
    method: 'GET',
  });
}
