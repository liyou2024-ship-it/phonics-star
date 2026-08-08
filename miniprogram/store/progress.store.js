"use strict";
/**
 * 学习进度状态管理
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressStore = void 0;
const progressService = __importStar(require("../services/progress"));
let state = progressService.getProgress();
const listeners = new Set();
function notify() {
    listeners.forEach(fn => fn());
}
exports.progressStore = {
    getState() {
        return state;
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    /** 重新从存储加载 */
    reload() {
        state = progressService.getProgress();
        notify();
    },
    /** 获取课节进度 */
    getLessonProgress(lessonId) {
        return state.lessonProgressMap[lessonId] || null;
    },
    /** 更新课节进度 */
    updateLessonProgress(lessonId, update) {
        progressService.updateLessonProgress(lessonId, update);
        this.reload();
    },
    /** 完成课节 */
    completeLesson(lessonId, stars, score) {
        progressService.completeLesson(lessonId, stars, score);
        this.reload();
    },
    /** 判断课节是否已完成 */
    isLessonCompleted(lessonId) {
        return state.lessonProgressMap[lessonId]?.status === 'completed';
    },
    /** 判断课节是否解锁 */
    isLessonUnlocked(lessonId) {
        const lp = state.lessonProgressMap[lessonId];
        return lp?.status === 'available' || lp?.status === 'in_progress';
    },
    /** 获取课程完成率 */
    getCompletionRate() {
        const total = Object.keys(state.lessonProgressMap).length;
        if (total === 0)
            return 0;
        const completed = Object.values(state.lessonProgressMap)
            .filter(lp => lp.status === 'completed').length;
        return Math.round((completed / total) * 100);
    },
};
//# sourceMappingURL=progress.store.js.map