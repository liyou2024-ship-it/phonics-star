"use strict";
/**
 * 本地存储服务
 * 封装 wx.setStorageSync / wx.getStorageSync，提供类型安全接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const STORAGE_PREFIX = 'ps_';
function key(name) {
    return `${STORAGE_PREFIX}${name}`;
}
exports.storage = {
    /** 读取 */
    get(name) {
        try {
            const value = wx.getStorageSync(key(name));
            return value !== '' ? value : null;
        }
        catch (e) {
            console.error(`[Storage] 读取 ${name} 失败`, e);
            return null;
        }
    },
    /** 写入 */
    set(name, value) {
        try {
            wx.setStorageSync(key(name), value);
        }
        catch (e) {
            console.error(`[Storage] 写入 ${name} 失败`, e);
        }
    },
    /** 删除 */
    remove(name) {
        try {
            wx.removeStorageSync(key(name));
        }
        catch (e) {
            console.error(`[Storage] 删除 ${name} 失败`, e);
        }
    },
    /** 清空所有本应用数据 */
    clear() {
        try {
            const info = wx.getStorageInfoSync();
            info.keys.forEach(k => {
                if (k.startsWith(STORAGE_PREFIX)) {
                    wx.removeStorageSync(k);
                }
            });
        }
        catch (e) {
            console.error('[Storage] 清空失败', e);
        }
    },
    /** 获取存储信息 */
    info() {
        return wx.getStorageInfoSync();
    },
};
//# sourceMappingURL=storage.js.map