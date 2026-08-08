import { userStore } from '../../store/user.store';
import { progressStore } from '../../store/progress.store';
import { rewardStore } from '../../modules/rewards/reward.store';
import { ROUTES } from '../../config/routes';
import { ensureLogin, getStoredUser } from '../../services/auth.service';

Page({
  data: {
    userName: '',
    userNameInitial: '',
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
      const user = userStore.getState();
      const progress = progressStore.getState();
      const rewards = rewardStore.getState();
      const completedCount = Object.values(progress.lessonProgressMap).filter(
        (lp) => lp.status === 'completed'
      ).length;
      const nickname = user.profile.nickname || '?';
      this.setData({
        userName: nickname,
        userNameInitial: nickname.charAt(0).toUpperCase(),
        avatarUrl: user.profile.avatarUrl,
        streak: progress.streak,
        totalStars: rewards.totalStars,
        completedCount,
        loading: false,
      });
      this.refreshLoginStatus();
    } catch (err) {
      this.setData({ loading: false, error: (err as Error).message });
    }
  },

  /** 刷新微信登录状态展示 */
  refreshLoginStatus() {
    const stored = getStoredUser();
    this.setData({
      loginStatus: stored ? '已通过微信登录' : '未登录',
      userId: stored ? stored.id : '',
    });
  },

  /** 微信登录 / 重新登录：无账号会自动注册（昵称 新用户+随机数字） */
  onWechatLogin() {
    if (this.data.logging) return;
    this.setData({ logging: true });
    ensureLogin()
      .then((profile) => {
        userStore.setProfile(profile);
        const nick = profile.nickname || '?';
        this.setData({
          userName: nick,
          userNameInitial: nick.charAt(0).toUpperCase(),
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
    wx.navigateTo({ url: ROUTES.SETTINGS });
  },

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { tab } = e.detail;
    const rm: Record<string, string> = {
      home: ROUTES.HOME,
      course: ROUTES.COURSE_MAP,
      practice: ROUTES.PRACTICE,
      growth: ROUTES.GROWTH,
      profile: ROUTES.PROFILE,
    };
    const route = rm[tab];
    if (route && route !== ROUTES.PROFILE) wx.redirectTo({ url: route });
  },

  onGoToParentReport() {
    wx.navigateTo({ url: ROUTES.PARENT_REPORT });
  },

  onToggleParentMode() {
    const next = !this.data.parentMode;
    this.setData({ parentMode: next });
    wx.showToast({ title: next ? '已切换到家长模式' : '已退出家长模式', icon: 'none' });
  },
});
