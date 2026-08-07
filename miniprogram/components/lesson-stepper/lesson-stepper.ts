Component({
  properties: {
    stages: { type: Array, value: [] },
  },
  data: {},
  methods: {
    onStageTap(e: WechatMiniprogram.BaseEvent) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('select', { index });
    },
  },
});
