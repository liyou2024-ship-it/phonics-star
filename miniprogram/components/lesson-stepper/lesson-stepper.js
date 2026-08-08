"use strict";
Component({
    properties: {
        stages: { type: Array, value: [] },
    },
    data: {},
    methods: {
        onStageTap(e) {
            const { index } = e.currentTarget.dataset;
            this.triggerEvent('select', { index });
        },
    },
});
//# sourceMappingURL=lesson-stepper.js.map