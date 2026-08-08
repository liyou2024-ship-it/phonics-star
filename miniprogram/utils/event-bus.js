"use strict";
/**
 * 简易事件总线
 * 用于页面/组件间轻量通信
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
class EventBus {
    constructor() {
        this.handlers = new Map();
    }
    on(event, handler) {
        const list = this.handlers.get(event) || [];
        list.push(handler);
        this.handlers.set(event, list);
    }
    off(event, handler) {
        const list = this.handlers.get(event);
        if (!list)
            return;
        this.handlers.set(event, list.filter(h => h !== handler));
    }
    emit(event, ...args) {
        const list = this.handlers.get(event);
        if (!list)
            return;
        list.forEach(h => h(...args));
    }
    clear() {
        this.handlers.clear();
    }
}
exports.eventBus = new EventBus();
//# sourceMappingURL=event-bus.js.map