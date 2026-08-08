"use strict";
/**
 * 练习会话持久化
 * 保存、恢复、清除练习会话到本地存储
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSession = saveSession;
exports.restoreSession = restoreSession;
exports.clearSession = clearSession;
const storage_1 = require("../../services/storage");
const SESSION_PREFIX = 'practice_session_';
function key(mode) {
    return `${SESSION_PREFIX}${mode}`;
}
/** 保存会话 */
function saveSession(session) {
    storage_1.storage.set(key(session.mode), session);
}
/** 恢复会话，不存在返回 null */
function restoreSession(mode) {
    return storage_1.storage.get(key(mode));
}
/** 清除指定模式的会话 */
function clearSession(mode) {
    storage_1.storage.remove(key(mode));
}
//# sourceMappingURL=practice-session.js.map