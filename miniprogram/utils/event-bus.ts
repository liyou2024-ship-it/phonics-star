/**
 * 简易事件总线
 * 用于页面/组件间轻量通信
 */

type EventHandler = (...args: unknown[]) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  off(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event);
    if (!list) return;
    this.handlers.set(event, list.filter(h => h !== handler));
  }

  emit(event: string, ...args: unknown[]): void {
    const list = this.handlers.get(event);
    if (!list) return;
    list.forEach(h => h(...args));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
