/**
 * 课程学习页面
 * 使用 LessonEngine + StepRegistry 驱动步骤渲染
 */
import { getLessonEngine, EngineState } from '../../modules/lesson/lesson-engine';
import { getStepComponent } from '../../modules/lesson/step-registry';
import { StepResult } from '../../modules/lesson/types';
import { progressStore } from '../../store/progress.store';
import { rewardStore } from '../../modules/rewards/reward.store';

Page({
  data: {
    lessonId: '',
    engineState: null as EngineState | null,
    currentComponent: '',
    currentComponentProps: {} as Record<string, unknown>,
    stepResults: [] as StepResult[],
  },

  onLoad(options: Record<string, string>) {
    const lessonId = options.lessonId || 'L001';
    this.setData({ lessonId });

    const engine = getLessonEngine();
    engine.loadLesson(lessonId);

    // Subscribe to engine state changes
    engine.subscribe((state) => {
      this.updateComponent(state);
    });

    // Load initial state
    this.updateComponent(engine.getState());
  },

  onUnload() {
    getLessonEngine().reset();
  },

  /** Update component based on engine state */
  updateComponent(state: EngineState) {
    const { lesson, session, currentStepIndex, loading, error } = state;
    this.setData({ engineState: state });

    if (loading || error || !lesson || !session) return;

    const step = lesson.steps[currentStepIndex];
    if (!step) return;

    const componentPath = getStepComponent(step.type);
    if (!componentPath) {
      console.error(`Unknown step type: ${step.type}`);
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
  onStepComplete(e: WechatMiniprogram.CustomEvent) {
    const result: StepResult = e.detail as StepResult;
    const engine = getLessonEngine();

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

    progressStore.completeLesson(lessonId, stars, avgScore);
    rewardStore.addStars(stars);
    rewardStore.addEnergy(10 + stars * 5);

    wx.showToast({ title: '课程完成！', icon: 'success' });
  },

  onBack() {
    wx.navigateBack();
  },
});
