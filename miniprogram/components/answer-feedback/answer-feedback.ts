Component({
  properties: {
    type: { type: String, value: 'correct' },
    message: { type: String, value: '' },
    show: { type: Boolean, value: false },
    correctAnswer: { type: String, value: '' },
  },

  data: {
    icon: '',
    themeClass: '',
  },

  observers: {
    'type, show'(type: string, show: boolean) {
      if (!show) return;
      const config: Record<string, { icon: string; cls: string }> = {
        correct: { icon: '✅', cls: 'feedback--correct' },
        incorrect: { icon: '❌', cls: 'feedback--incorrect' },
        retry: { icon: '🔄', cls: 'feedback--retry' },
        completed: { icon: '🎉', cls: 'feedback--completed' },
      };
      const c = config[type] || config.correct;
      this.setData({ icon: c.icon, themeClass: c.cls });

      if (type === 'correct' || type === 'incorrect') {
        setTimeout(() => {
          this.setData({ show: false });
          this.triggerEvent('dismiss');
        }, 2000);
      }
    },
  },

  methods: {
    onClose() {
      this.setData({ show: false });
      this.triggerEvent('dismiss');
    },
  },
});
