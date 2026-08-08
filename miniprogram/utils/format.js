"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayDate = getTodayDate;
exports.formatDate = formatDate;
exports.formatDuration = formatDuration;
exports.getRelativeTime = getRelativeTime;
/** 获取今天的日期字符串 YYYY-MM-DD */
function getTodayDate() {
    const d = new Date();
    return formatDate(d);
}
/** 格式化日期为 YYYY-MM-DD */
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
/** 格式化时长为 mm:ss */
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
/** 获取相对时间描述 */
function getRelativeTime(isoString) {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = now - then;
    if (diff < 60000)
        return '刚刚';
    if (diff < 3600000)
        return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000)
        return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
}
//# sourceMappingURL=format.js.map