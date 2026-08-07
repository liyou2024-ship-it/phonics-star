Component({
  properties: {
    round: { type: Number, value: 1 },
    maxRounds: { type: Number, value: 10 },
    score: { type: Number, value: 0 },
    combo: { type: Number, value: 0 },
    timeLeft: { type: Number, value: 0 },
  },

  data: {
    comboVisible: false,
  },

  observers: {
    'combo'(val: number) {
      this.setData({ comboVisible: val > 1 });
    },
  },
});
