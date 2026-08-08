"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 课程学习页面
 * 使用 LessonEngine + StepRegistry 驱动步骤渲染
 */
const lesson_engine_1 = require("../../modules/lesson/lesson-engine");
const step_registry_1 = require("../../modules/lesson/step-registry");
const progress_store_1 = require("../../store/progress.store");
const reward_store_1 = require("../../modules/rewards/reward.store");
Page({
    data: {
        lessonId: '',
        engineState: null,
        currentComponent: '',
        currentComponentProps: {},
        stepResults: [],
    },
    onLoad(options) {
        const lessonId = options.lessonId || 'L001';
        this.setData({ lessonId });
        const engine = (0, lesson_engine_1.getLessonEngine)();
        engine.loadLesson(lessonId);
        // Subscribe to engine state changes
        engine.subscribe((state) => {
            this.updateComponent(state);
        });
        // Load initial state
        this.updateComponent(engine.getState());
    },
    onUnload() {
        (0, lesson_engine_1.getLessonEngine)().reset();
    },
    /** Update component based on engine state */
    updateComponent(state) {
        const { lesson, session, currentStepIndex, loading, error } = state;
        this.setData({ engineState: state });
        if (loading || error || !lesson || !session)
            return;
        const step = lesson.steps[currentStepIndex];
        if (!step)
            return;
        const componentPath = (0, step_registry_1.getStepComponent)(step.type);
        if (!componentPath) {
            console.error(`Unknown step type: ${step.type}`);
            // 安全网：未知步骤不阻断整节课，给出"跳过"出口
            this.setData({
                currentComponent: '__unsupported__',
                currentComponentProps: {
                    step,
                    lesson,
                    state: session.stepStates[currentStepIndex],
                },
            });
            return;
        }
        this.setData({
            currentComponent: componentPath,
            currentComponentProps: {
                step,
                lesson,
                state: session.stepStates[currentStepIndex],
                stepResults: this.data.stepResults,
            },
        });
    },
    /** Step completion handler */
    onStepComplete(e) {
        const result = e.detail;
        const engine = (0, lesson_engine_1.getLessonEngine)();
        // Store result for later use (reward calculation)
        const stepResults = [...this.data.stepResults, result];
        this.setData({ stepResults });
        engine.completeStep(result);
        const state = engine.getState();
        if (state.session?.status === 'completed') {
            this.onLessonComplete();
        }
    },
    /** Lesson finished */
    onLessonComplete() {
        const { lessonId, stepResults } = this.data;
        const avgScore = stepResults.length > 0
            ? Math.round(stepResults.reduce((sum, r) => sum + r.score, 0) / stepResults.length)
            : 100;
        const stars = stepResults.length >= 6
            ? Math.min(3, 1 + (avgScore >= 80 ? 1 : 0) + (avgScore >= 90 ? 1 : 0))
            : Math.max(1, Math.min(3, Math.ceil(stepResults.length / 3)));
        progress_store_1.progressStore.completeLesson(lessonId, stars, avgScore);
        reward_store_1.rewardStore.addStars(stars);
        reward_store_1.rewardStore.addEnergy(10 + stars * 5);
        wx.showToast({ title: '课程完成！', icon: 'success' });
    },
    onBack() {
        wx.navigateBack();
    },
    /** 未知步骤的安全出口：跳过，不阻断整节课 */
    onSkipStep() {
        const result = { score: 100, attempts: 1, duration: 0 };
        this.onStepComplete({ detail: result });
    },
});
//# sourceMappingURL=lesson.js.map