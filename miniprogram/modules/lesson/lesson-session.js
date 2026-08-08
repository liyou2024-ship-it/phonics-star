"use strict";
/**
 * 课程会话管理
 * 创建、恢复、保存课程学习会话
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.saveSession = saveSession;
exports.restoreSession = restoreSession;
exports.clearSession = clearSession;
exports.advanceStep = advanceStep;
exports.failStep = failStep;
exports.retryStep = retryStep;
exports.updateStepResult = updateStepResult;
const storage_1 = require("../../services/storage");
const course_1 = require("../../services/course");
const SESSION_PREFIX = 'lesson_session_';
/** 生成唯一 sessionId */
function generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
/** 创建新会话 */
function createSession(lessonId) {
    const lesson = (0, course_1.getLessonById)(lessonId);
    if (!lesson)
        throw new Error(`课程 ${lessonId} 不存在`);
    const stepStates = lesson.steps.map((step, index) => ({
        stepId: step.id,
        status: index === 0 ? 'active' : 'not_started',
    }));
    const session = {
        sessionId: generateSessionId(),
        lessonId,
        currentStepIndex: 0,
        stepStates,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'in_progress',
    };
    saveSession(session);
    return session;
}
/** 保存会话到本地 */
function saveSession(session) {
    session.updatedAt = new Date().toISOString();
    storage_1.storage.set(`${SESSION_PREFIX}${session.lessonId}`, session);
}
/** 恢复会话 */
function restoreSession(lessonId) {
    return storage_1.storage.get(`${SESSION_PREFIX}${lessonId}`);
}
/** 清除会话 */
function clearSession(lessonId) {
    storage_1.storage.remove(`${SESSION_PREFIX}${lessonId}`);
}
/** 进入下一步 */
function advanceStep(session) {
    const nextIndex = session.currentStepIndex + 1;
    if (nextIndex >= session.stepStates.length) {
        // 所有步骤完成
        session.status = 'completed';
        saveSession(session);
        return session;
    }
    // 标记当前步骤完成，下一步激活
    session.stepStates[session.currentStepIndex].status = 'completed';
    session.stepStates[nextIndex].status = 'active';
    session.currentStepIndex = nextIndex;
    saveSession(session);
    return session;
}
/** 标记当前步骤失败 */
function failStep(session) {
    session.stepStates[session.currentStepIndex].status = 'failed';
    saveSession(session);
    return session;
}
/** 重试当前步骤 */
function retryStep(session) {
    session.stepStates[session.currentStepIndex].status = 'active';
    session.stepStates[session.currentStepIndex].result = undefined;
    saveSession(session);
    return session;
}
/** 更新步骤结果 */
function updateStepResult(session, stepIndex, result) {
    session.stepStates[stepIndex].result = result;
    saveSession(session);
    return session;
}
//# sourceMappingURL=lesson-session.js.map