Component({
  properties: {
    activeTab: { type: String, value: 'home' },
  },
  data: {
    tabs: [
      { key: 'home', label: '首页', icon: '🏠' },
      { key: 'course', label: '课程', icon: '📚' },
      { key: 'practice', label: '练习', icon: '🎯' },
      { key: 'growth', label: '成长', icon: '🌟' },
      { key: 'profile', label: '我的', icon: '👤' },
    ],
  },
  methods: {
    onTabTap(e: WechatMiniprogram.BaseEvent) {
      const { key } = e.currentTarget.dataset;
      this.triggerEvent('change', { tab: key });
    },
  },
});
