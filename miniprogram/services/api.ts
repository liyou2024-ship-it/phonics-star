/**
 * API 服务
 * 当前使用 Mock 数据，后续对接真实后端
 */

/**
 * Mock 请求封装
 * 模拟网络延迟，返回 Mock 数据
 */
async function mockRequest<T>(data: T, delayMs = 300): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delayMs);
  });
}

/** 通用请求方法 */
export const api = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get<T>(_url: string, _params?: Record<string, unknown>): Promise<T> {
    // TODO: 对接真实后端 API
    throw new Error('API 尚未接入后端，请使用 Mock 数据');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async post<T>(_url: string, _data?: Record<string, unknown>): Promise<T> {
    throw new Error('API 尚未接入后端，请使用 Mock 数据');
  },
};
