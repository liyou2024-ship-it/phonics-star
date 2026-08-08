"use strict";
Component({
    properties: {
        src: { type: String, value: '' },
        icon: { type: String, value: '🔊' },
        text: { type: String, value: '' },
        type: { type: String, value: 'primary' },
        disabled: { type: Boolean, value: false },
    },
    data: { playing: false },
    methods: {
        handleTap() {
            if (this.properties.disabled)
                return;
            // 触发父组件事件
            this.triggerEvent('play', { src: this.properties.src });
        },
    },
});
//# sourceMappingURL=audio-button.js.map