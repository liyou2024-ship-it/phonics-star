import { userStore } from '../../store/user.store';
import { progressStore } from '../../store/progress.store';
import { courseStore } from '../../store/course.store';
import { rewardStore } from '../../modules/rewards/reward.store';
import { getReviewCount } from '../../modules/review/review.service';
import { ROUTES } from '../../config/routes';
import { LEVEL_NAMES } from '../../utils/constants';
import { storage } from '../../services/storage';

Page({
  data: {
    // Mock 数据
    userName: '',
    currentStage: '字母森林',
    todayLesson: '',
    reviewCount: 0,
    streak: 0,
    stars: 0,
    energy: 0,
    completionRate: 0,
    loading: true,
    error: '',
    // 是否显示首页「开始能力评估」提示窗口（完成评估后隐藏）
    showAssessmentCta: true,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    try {
      // 加载课程数据
      courseStore.load();

      const user = userStore.getState();
      const progress = progressStore.getState();
      const rewards = rewardStore.getState();

      // 计算当前阶段
      const currentLesson = courseStore.getState().lessons.find(
        l => l.id === progress.currentLessonId
      );
      const unit = currentLesson
        ? courseStore.getState().units.find(u => u.lessonIds.includes(currentLesson.id))
        : null;
      const level = unit
        ? courseStore.getState().levels.find(l => l.unitIds.includes(unit.id))
        : null;

      this.setData({
        userName: user.profile.nickname,
        currentStage: level ? LEVEL_NAMES[level.id] || level.name : '字母森林',
        todayLesson: currentLesson?.title || 'L001',
        reviewCount: getReviewCount(),
        streak: progress.streak,
        stars: rewards.totalStars,
        energy: rewards.energy,
        completionRate: progressStore.getCompletionRate(),
        // 完成过评估则隐藏首页「开始能力评估」提示窗口
        showAssessmentCta: !storage.get('assessment_completed'),
        loading: false,
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: (err as Error).message || '加载失败',
      });
    }
  },

  /** 继续学习 */
  onContinueLearning() {
    const progress = progressStore.getState();
    wx.navigateTo({
      url: `${ROUTES.LESSON}?lessonId=${progress.currentLessonId}`,
    });
  },

  /** 底部导航切换 */
  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { tab } = e.detail;
    const routeMap: Record<string, string> = {
      home: ROUTES.HOME,
      course: ROUTES.COURSE_MAP,
      practice: ROUTES.PRACTICE,
      growth: ROUTES.GROWTH,
      profile: ROUTES.PROFILE,
    };
    const route = routeMap[tab];
    if (route && route !== ROUTES.HOME) {
      wx.redirectTo({ url: route });
    }
  },

  /** 跳转课程地图 */
  onGoToCourseMap() {
    wx.navigateTo({ url: ROUTES.COURSE_MAP });
  },

  /** 跳转练习中心 */
  onGoToPractice() {
    wx.navigateTo({ url: ROUTES.PRACTICE });
  },

  /** 跳转成长中心 */
  onGoToGrowth() {
    wx.navigateTo({ url: ROUTES.GROWTH });
  },

  /** 跳转能力评估 */
  onGoToAssessment() {
    wx.navigateTo({ url: ROUTES.ASSESSMENT });
  },
});
