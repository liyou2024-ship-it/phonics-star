"use strict";
Component({
    properties: {
        slots: { type: Number, value: 3 },
        answers: { type: Array, value: [] },
    },
    data: {
        slotList: [],
    },
    observers: {
        'slots, answers'(total, ans) {
            const list = [];
            for (let i = 0; i < total; i++) {
                list.push({ index: i, value: ans[i] || '', filled: !!ans[i] });
            }
            this.setData({ slotList: list });
        },
    },
    methods: {
        onSlotTap(e) {
            const idx = e.currentTarget.dataset.index;
            if (this.data.slotList[idx].filled) {
                this.triggerEvent('tap', { index: idx, value: this.data.slotList[idx].value });
            }
        },
    },
});
//# sourceMappingURL=answer-slots.js.map