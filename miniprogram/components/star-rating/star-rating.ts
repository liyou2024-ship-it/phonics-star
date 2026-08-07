Component({
  properties: {
    stars: { type: Number, value: 0 },
    maxStars: { type: Number, value: 3 },
    size: { type: String, value: 'normal' },
  },
  data: {
    filled: [] as boolean[],
  },
  observers: {
    'stars, maxStars'(stars: number, maxStars: number) {
      const filled: boolean[] = [];
      for (let i = 0; i < maxStars; i++) {
        filled.push(i < stars);
      }
      this.setData({ filled });
    },
  },
});
