"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_store_1 = require("../../store/user.store");
const progress_store_1 = require("../../store/progress.store");
const course_store_1 = require("../../store/course.store");
const reward_store_1 = require("../../modules/rewards/reward.store");
const review_service_1 = require("../../modules/review/review.service");
const routes_1 = require("../../config/routes");
const constants_1 = require("../../utils/constants");
const storage_1 = require("../../services/storage");
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
            course_store_1.courseStore.load();
            const user = user_store_1.userStore.getState();
            const progress = progress_store_1.progressStore.getState();
            const rewards = reward_store_1.rewardStore.getState();
            // 计算当前阶段
            const currentLesson = course_store_1.courseStore.getState().lessons.find(l => l.id === progress.currentLessonId);
            const unit = currentLesson
                ? course_store_1.courseStore.getState().units.find(u => u.lessonIds.includes(currentLesson.id))
                : null;
            const level = unit
                ? course_store_1.courseStore.getState().levels.find(l => l.unitIds.includes(unit.id))
                : null;
            this.setData({
                userName: user.profile.nickname,
                currentStage: level ? constants_1.LEVEL_NAMES[level.id] || level.name : '字母森林',
                todayLesson: currentLesson?.title || 'L001',
                reviewCount: (0, review_service_1.getReviewCount)(),
                streak: progress.streak,
                stars: rewards.totalStars,
                energy: rewards.energy,
                completionRate: progress_store_1.progressStore.getCompletionRate(),
                // 完成过评估则隐藏首页「开始能力评估」提示窗口
                showAssessmentCta: !storage_1.storage.get('assessment_completed'),
                loading: false,
            });
        }
        catch (err) {
            this.setData({
                loading: false,
                error: err.message || '加载失败',
            });
        }
    },
    /** 继续学习 */
    onContinueLearning() {
        const progress = progress_store_1.progressStore.getState();
        wx.navigateTo({
            url: `${routes_1.ROUTES.LESSON}?lessonId=${progress.currentLessonId}`,
        });
    },
    /** 底部导航切换 */
    onTabChange(e) {
        const { tab } = e.detail;
        const routeMap = {
            home: routes_1.ROUTES.HOME,
            course: routes_1.ROUTES.COURSE_MAP,
            practice: routes_1.ROUTES.PRACTICE,
            growth: routes_1.ROUTES.GROWTH,
            profile: routes_1.ROUTES.PROFILE,
        };
        const route = routeMap[tab];
        if (route && route !== routes_1.ROUTES.HOME) {
            wx.redirectTo({ url: route });
        }
    },
    /** 跳转课程地图 */
    onGoToCourseMap() {
        wx.navigateTo({ url: routes_1.ROUTES.COURSE_MAP });
    },
    /** 跳转练习中心 */
    onGoToPractice() {
        wx.navigateTo({ url: routes_1.ROUTES.PRACTICE });
    },
    /** 跳转成长中心 */
    onGoToGrowth() {
        wx.navigateTo({ url: routes_1.ROUTES.GROWTH });
    },
    /** 跳转能力评估 */
    onGoToAssessment() {
        wx.navigateTo({ url: routes_1.ROUTES.ASSESSMENT });
    },
});
//# sourceMappingURL=home.js.map