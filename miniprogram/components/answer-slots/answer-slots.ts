Component({
  properties: {
    slots: { type: Number, value: 3 },
    answers: { type: Array, value: [] },
  },

  data: {
    slotList: [] as Array<{ index: number; value: string; filled: boolean }>,
  },

  observers: {
    'slots, answers'(total: number, ans: string[]) {
      const list = [];
      for (let i = 0; i < total; i++) {
        list.push({ index: i, value: ans[i] || '', filled: !!ans[i] });
      }
      this.setData({ slotList: list });
    },
  },

  methods: {
    onSlotTap(e: WechatMiniprogram.TouchEvent) {
      const idx = e.currentTarget.dataset.index;
      if (this.data.slotList[idx].filled) {
        this.triggerEvent('tap', { index: idx, value: this.data.slotList[idx].value });
      }
    },
  },
});
