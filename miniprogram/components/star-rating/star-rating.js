"use strict";
Component({
    properties: {
        stars: { type: Number, value: 0 },
        maxStars: { type: Number, value: 3 },
        size: { type: String, value: 'normal' },
    },
    data: {
        filled: [],
    },
    observers: {
        'stars, maxStars'(stars, maxStars) {
            const filled = [];
            for (let i = 0; i < maxStars; i++) {
                filled.push(i < stars);
            }
            this.setData({ filled });
        },
    },
});
//# sourceMappingURL=star-rating.js.map