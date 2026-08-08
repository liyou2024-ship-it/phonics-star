"use strict";
/**
 * 课程引擎
 * 课程步骤状态机，管理步骤流转
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonEngine = void 0;
exports.getLessonEngine = getLessonEngine;
const lesson_session_1 = require("./lesson-session");
const course_1 = require("../../services/course");
const event_bus_1 = require("../../utils/event-bus");
class LessonEngine {
    constructor() {
        this.state = {
            lesson: null,
            session: null,
            currentStepIndex: 0,
            currentStepState: null,
            loading: false,
            error: '',
        };
        this.listeners = new Set();
    }
    getState() {
        return { ...this.state };
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notify() {
        const state = this.getState();
        this.listeners.forEach(fn => fn(state));
    }
    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }
    /** 加载课程并创建/恢复会话 */
    loadLesson(lessonId) {
        this.setState({ loading: true, error: '' });
        try {
            const lesson = (0, course_1.getLessonById)(lessonId);
            if (!lesson) {
                this.setState({ loading: false, error: '课程不存在' });
                return;
            }
            // 尝试恢复已有会话
            let session = (0, lesson_session_1.restoreSession)(lessonId);
            if (!session || session.status === 'completed') {
                // 创建新会话（已完成也重新开始）
                session = (0, lesson_session_1.createSession)(lessonId);
            }
            const currentStepState = session.stepStates[session.currentStepIndex] || null;
            this.setState({
                lesson,
                session,
                currentStepIndex: session.currentStepIndex,
                currentStepState,
                loading: false,
            });
            event_bus_1.eventBus.emit('lesson_started', {
                lessonId,
                sessionId: session.sessionId,
            });
        }
        catch (err) {
            this.setState({
                loading: false,
                error: err.message || '加载课程失败',
            });
        }
    }
    /** 完成当前步骤，进入下一步 */
    completeStep(result) {
        const { session, currentStepIndex } = this.state;
        if (!session)
            return;
        // 保存步骤结果
        const updated = (0, lesson_session_1.updateStepResult)(session, currentStepIndex, {
            ...result,
            attempts: result.attempts || 1,
            duration: result.duration || 0,
        });
        // 记录步骤完成事件
        event_bus_1.eventBus.emit('lesson_step_completed', {
            lessonId: updated.lessonId,
            sessionId: updated.sessionId,
            stepIndex: currentStepIndex,
            result,
        });
        // 进入下一步
        const nextSession = (0, lesson_session_1.advanceStep)(updated);
        if (nextSession.status === 'completed') {
            // 课程完成
            event_bus_1.eventBus.emit('lesson_completed', {
                lessonId: nextSession.lessonId,
                sessionId: nextSession.sessionId,
                stepStates: nextSession.stepStates,
            });
        }
        this.setState({
            session: nextSession,
            currentStepIndex: nextSession.currentStepIndex,
            currentStepState: nextSession.stepStates[nextSession.currentStepIndex] || null,
        });
    }
    /** 重试当前步骤 */
    retryCurrentStep() {
        const { session } = this.state;
        if (!session)
            return;
        const updated = (0, lesson_session_1.retryStep)(session);
        this.setState({
            session: updated,
            currentStepState: updated.stepStates[updated.currentStepIndex],
        });
    }
    /** 获取当前步骤的组件路径 */
    getCurrentStepComponent() {
        const { lesson, currentStepIndex } = this.state;
        if (!lesson || !lesson.steps[currentStepIndex])
            return null;
        const step = lesson.steps[currentStepIndex];
        const { getStepComponent } = require('./step-registry');
        return getStepComponent(step.type);
    }
    /** 重置引擎 */
    reset() {
        this.state = {
            lesson: null,
            session: null,
            currentStepIndex: 0,
            currentStepState: null,
            loading: false,
            error: '',
        };
        this.notify();
    }
}
exports.LessonEngine = LessonEngine;
/** 单例 */
let engineInstance = null;
function getLessonEngine() {
    if (!engineInstance)
        engineInstance = new LessonEngine();
    return engineInstance;
}
//# sourceMappingURL=lesson-engine.js.map