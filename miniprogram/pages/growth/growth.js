"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const progress_store_1 = require("../../store/progress.store");
const reward_store_1 = require("../../modules/rewards/reward.store");
const user_store_1 = require("../../store/user.store");
const routes_1 = require("../../config/routes");
Page({
    data: {
        userName: '',
        level: { name: '拼读新星', emoji: '🐰' },
        pet: { name: '小苗', emoji: '🌱', level: 1 },
        totalStars: 0,
        energy: 0,
        completedCount: 0,
        masteredPhonemes: 0,
        masteredWords: 0,
        badges: [],
        loading: false,
        error: '',
    },
    onShow() {
        this.loadData();
    },
    loadData() {
        try {
            const user = user_store_1.userStore.getState();
            const progress = progress_store_1.progressStore.getState();
            const rewards = reward_store_1.rewardStore.getState();
            const completedCount = Object.values(progress.lessonProgressMap)
                .filter(lp => lp.status === 'completed').length;
            this.setData({
                userName: user.profile.nickname,
                totalStars: rewards.totalStars,
                energy: rewards.energy,
                completedCount,
                masteredPhonemes: progress.masteredPhonemeIds.length,
                masteredWords: progress.masteredWordIds.length,
                badges: [
                    { name: '初识拼读', icon: '📖', earned: completedCount >= 1 },
                    { name: '学霸', icon: '🎓', earned: completedCount >= 10 },
                    { name: '坚持3天', icon: '🔥', earned: progress.streak >= 3 },
                ],
                loading: false,
            });
        }
        catch (err) {
            this.setData({ loading: false, error: err.message });
        }
    },
    onTabChange(e) {
        const { tab } = e.detail;
        const rm = { home: routes_1.ROUTES.HOME, course: routes_1.ROUTES.COURSE_MAP, practice: routes_1.ROUTES.PRACTICE, growth: routes_1.ROUTES.GROWTH, profile: routes_1.ROUTES.PROFILE };
        const route = rm[tab];
        if (route && route !== routes_1.ROUTES.GROWTH)
            wx.redirectTo({ url: route });
    },
});
//# sourceMappingURL=growth.js.map