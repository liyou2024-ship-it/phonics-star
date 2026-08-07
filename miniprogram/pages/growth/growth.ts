import { progressStore } from '../../store/progress.store';
import { rewardStore } from '../../modules/rewards/reward.store';
import { userStore } from '../../store/user.store';
import { ROUTES } from '../../config/routes';

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
    badges: [] as Array<{ name: string; icon: string; earned: boolean }>,
    loading: false,
    error: '',
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      const user = userStore.getState();
      const progress = progressStore.getState();
      const rewards = rewardStore.getState();
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
    } catch (err) {
      this.setData({ loading: false, error: (err as Error).message });
    }
  },
  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { tab } = e.detail;
    const rm: Record<string, string> = { home: ROUTES.HOME, course: ROUTES.COURSE_MAP, practice: ROUTES.PRACTICE, growth: ROUTES.GROWTH, profile: ROUTES.PROFILE };
    const route = rm[tab];
    if (route && route !== ROUTES.GROWTH) wx.redirectTo({ url: route });
  },
});
