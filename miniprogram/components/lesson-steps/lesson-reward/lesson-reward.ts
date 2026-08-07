/**
 * 课程奖励步骤组件
 * 根据所有步骤结果计算星星、能量、徽章
 */

import { StepResult } from '../../../modules/lesson/types';

Component({
  properties: {
    step: { type: Object, value: {} },
    lesson: { type: Object, value: {} },
    state: { type: Object, value: { status: 'not_started' } },
    /** 所有步骤的执行结果 */
    stepResults: { type: Array, value: [] as StepResult[] },
  },

  data: {
    stars: 0,
    energy: 0,
    badges: [] as Array<{ name: string; icon: string }>,
    isFirstComplete: false,
    starRevealed: [false, false, false] as boolean[],
    rewardCalculated: false,
  },

  lifetimes: {
    attached() {
      this.calculateReward();
    },
  },

  methods: {
    calculateReward() {
      const results = this.properties.stepResults as StepResult[];
      const lesson = this.properties.lesson;

      // 基础: 1 星
      let stars = 1;
      let badges: Array<{ name: string; icon: string }> = [];

      // 计算平均分
      const scores = results.map(r => r.score || 0);
      const avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      // 80% 以上准确率 → +1 星
      if (avgScore >= 80) {
        stars += 1;
      }

      // 有发音练习且完成 → +1 星
      const hasPronunciation = results.some(r => r.data?.evalResult);
      if (hasPronunciation) {
        stars += 1;
      }

      // 能量奖励
      const baseEnergy = lesson?.reward?.energyReward || 10;
      const energy = baseEnergy + stars * 5;

      // 徽章
      if (stars >= 3) {
        badges.push({ name: '全星达人', icon: '🌟' });
      }
      if (avgScore >= 90) {
        badges.push({ name: '发音之星', icon: '🏆' });
      }
      if (lesson?.reward?.bonusBadgeId) {
        badges.push({ name: '特别徽章', icon: '🎖️' });
      }

      this.setData({
        stars: Math.min(stars, 3),
        energy,
        badges,
        isFirstComplete: !this.properties.state?.result,
        rewardCalculated: true,
        starRevealed: [false, false, false],
      });

      // 逐个揭示星星（动画）
      for (let i = 0; i < stars; i++) {
        setTimeout(() => {
          const revealed = [...this.data.starRevealed];
          revealed[i] = true;
          this.setData({ starRevealed: revealed });
        }, (i + 1) * 600);
      }
    },

    /** 完成课程 */
    onFinish() {
      this.triggerEvent('complete', {
        passed: true,
        score: this.data.stars * 100 / 3, // 映射为百分制
        attempts: 1,
        duration: 0,
        data: {
          stars: this.data.stars,
          energy: this.data.energy,
          badges: this.data.badges,
        },
      });
    },
  },
});
