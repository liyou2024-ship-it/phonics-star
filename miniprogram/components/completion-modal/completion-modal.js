"use strict";
Component({
    properties: {
        show: { type: Boolean, value: false },
        title: { type: String, value: '太棒了!' },
        message: { type: String, value: '' },
        stars: { type: Number, value: 3 },
        badges: { type: Array, value: [] },
    },
    methods: {
        onClose() {
            this.triggerEvent('close');
        },
    },
});
//# sourceMappingURL=completion-modal.js.map