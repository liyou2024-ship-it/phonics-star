Component({
  properties: {
    score: { type: Number, value: 0 },
    totalQuestions: { type: Number, value: 0 },
    correctCount: { type: Number, value: 0 },
    timeSpent: { type: Number, value: 0 },
  },

  data: {
    percentage: 0,
    stars: 0,
    timeDisplay: '',
  },

  observers: {
    'correctCount, totalQuestions'(correct: number, total: number) {
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      let stars = 0;
      if (pct >= 90) stars = 3;
      else if (pct >= 60) stars = 2;
      else if (pct > 0) stars = 1;
      this.setData({ percentage: pct, stars });
    },
    'timeSpent'(t: number) {
      const min = Math.floor(t / 60);
      const sec = t % 60;
      this.setData({ timeDisplay: `${min}:${sec.toString().padStart(2, '0')}` });
    },
  },

  methods: {
    onRetry() { this.triggerEvent('retry'); },
    onHome() { this.triggerEvent('home'); },
  },
});
