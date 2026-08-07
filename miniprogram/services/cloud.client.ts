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

/** 微信云托管环境 ID（来自云开发控制台） */
export const CLOUD_ENV = 'prod-d0gmqqe4yc47dd703';

const cloud: any = (wx as any).cloud;

/** 幂等初始化云（app.ts / 各次调用前都会尝试，重复调用安全） */
export function ensureCloudInit(): void {
  try {
    if (cloud && cloud.init) cloud.init({ env: CLOUD_ENV, traceUser: true });
  } catch (e) {
    // ignore
  }
}

export interface CloudCallOptions {
  /** 后端路由路径，如 /api/auth/login */
  path: string;
  /** HTTP 方法，默认 POST */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** 请求体 */
  data?: Record<string, any>;
  /** 额外请求头 */
  header?: Record<string, string>;
}

export interface CloudResult<T = any> {
  code: number;
  data?: T;
  message?: string;
}

/**
 * 调用云托管后端，统一处理成功/失败与业务码。
 * 成功 resolve 后端返回的 data 字段；失败 reject(Error)。
 */
export function cloudCall<T = any>(opts: CloudCallOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    ensureCloudInit();
    if (!cloud || typeof cloud.callContainer !== 'function') {
      reject(new Error('wx.cloud 未初始化或 callContainer 不可用'));
      return;
    }
    cloud.callContainer({
      config: { env: CLOUD_ENV },
      path: opts.path,
      method: opts.method || 'POST',
      header: Object.assign({ 'content-type': 'application/json' }, opts.header || {}),
      data: opts.data,
      success: (res: any) => {
        const body: CloudResult<T> | undefined = res && res.data;
        if (body && typeof body === 'object' && 'code' in body) {
          if (body.code === 0) {
            resolve(body.data as T);
          } else {
            reject(new Error(body.message || ('后端错误码 ' + body.code)));
          }
          return;
        }
        // 没有 code 字段时，直接把 body 当作 data 返回（兼容不同返回结构）
        resolve(body as unknown as T);
      },
      fail: (err: any) => reject(err),
    });
  });
}
