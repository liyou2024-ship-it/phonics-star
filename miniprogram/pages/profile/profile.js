"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_store_1 = require("../../store/user.store");
const progress_store_1 = require("../../store/progress.store");
const reward_store_1 = require("../../modules/rewards/reward.store");
const routes_1 = require("../../config/routes");
const auth_service_1 = require("../../services/auth.service");
Page({
    data: {
        userName: '',
        avatarUrl: '',
        streak: 0,
        totalStars: 0,
        completedCount: 0,
        parentMode: false,
        loading: false,
        error: '',
        // 登录相关
        loginStatus: '',
        userId: '',
        logging: false,
    },
    onShow() {
        try {
            const user = user_store_1.userStore.getState();
            const progress = progress_store_1.progressStore.getState();
            const rewards = reward_store_1.rewardStore.getState();
            const completedCount = Object.values(progress.lessonProgressMap).filter((lp) => lp.status === 'completed').length;
            this.setData({
                userName: user.profile.nickname,
                avatarUrl: user.profile.avatarUrl,
                streak: progress.streak,
                totalStars: rewards.totalStars,
                completedCount,
                loading: false,
            });
            this.refreshLoginStatus();
        }
        catch (err) {
            this.setData({ loading: false, error: err.message });
        }
    },
    /** 刷新微信登录状态展示 */
    refreshLoginStatus() {
        const stored = (0, auth_service_1.getStoredUser)();
        this.setData({
            loginStatus: stored ? '已通过微信登录' : '未登录',
            userId: stored ? stored.id : '',
        });
    },
    /** 微信登录 / 重新登录：无账号会自动注册（昵称 新用户+随机数字） */
    onWechatLogin() {
        if (this.data.logging)
            return;
        this.setData({ logging: true });
        (0, auth_service_1.ensureLogin)()
            .then((profile) => {
            user_store_1.userStore.setProfile(profile);
            this.setData({
                userName: profile.nickname,
                userId: profile.id,
                loginStatus: '已通过微信登录',
                logging: false,
            });
            wx.showToast({ title: '登录成功', icon: 'success' });
        })
            .catch((err) => {
            this.setData({ logging: false });
            wx.showToast({ title: '登录失败', icon: 'none' });
            console.warn('[profile] 微信登录失败', err);
        });
    },
    /** 进入设置页（账户管理：改密/绑手机/退登/注销） */
    onOpenSettings() {
        wx.navigateTo({ url: routes_1.ROUTES.SETTINGS });
    },
    onTabChange(e) {
        const { tab } = e.detail;
        const rm = {
            home: routes_1.ROUTES.HOME,
            course: routes_1.ROUTES.COURSE_MAP,
            practice: routes_1.ROUTES.PRACTICE,
            growth: routes_1.ROUTES.GROWTH,
            profile: routes_1.ROUTES.PROFILE,
        };
        const route = rm[tab];
        if (route && route !== routes_1.ROUTES.PROFILE)
            wx.redirectTo({ url: route });
    },
    onGoToParentReport() {
        wx.navigateTo({ url: routes_1.ROUTES.PARENT_REPORT });
    },
    onToggleParentMode() {
        const next = !this.data.parentMode;
        this.setData({ parentMode: next });
        wx.showToast({ title: next ? '已切换到家长模式' : '已退出家长模式', icon: 'none' });
    },
});
//# sourceMappingURL=profile.js.map