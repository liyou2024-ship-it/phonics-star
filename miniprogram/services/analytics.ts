/**
 * 分析服务
 * 记录学习事件并提供统计查询
 */

import { storage } from './storage';

export interface AnalyticsEvent {
  eventId: string;
  userId: string;
  sessionId: string;
  eventType: string;
  timestamp: string;
  duration: number;
  relatedId: string;
  payload: Record<string, unknown>;
}

const STORAGE_KEY = 'analytics_events';
const SESSION_KEY = 'analytics_session';

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getSessionId(): string {
  let sessionId = storage.get<string>(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuid();
    storage.set(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function loadEvents(): AnalyticsEvent[] {
  return storage.get<AnalyticsEvent[]>(STORAGE_KEY) || [];
}

function saveEvents(events: AnalyticsEvent[]): void {
  // Keep last 10,000 events
  if (events.length > 10000) {
    events = events.slice(events.length - 10000);
  }
  storage.set(STORAGE_KEY, events);
}

export function recordEvent(
  eventType: string,
  data: Partial<AnalyticsEvent> = {},
): void {
  const events = loadEvents();
  events.push({
    eventId: uuid(),
    userId: data.userId || 'default_user',
    sessionId: data.sessionId || getSessionId(),
    eventType,
    timestamp: data.timestamp || new Date().toISOString(),
    duration: data.duration || 0,
    relatedId: data.relatedId || '',
    payload: data.payload || {},
  });
  saveEvents(events);
}

export function getEventsByDate(date: string): AnalyticsEvent[] {
  return loadEvents().filter(e => e.timestamp.startsWith(date));
}

export function getEventsByType(eventType: string): AnalyticsEvent[] {
  return loadEvents().filter(e => e.eventType === eventType);
}

export function getStudyDuration(date: string): number {
  const events = getEventsByDate(date);
  return Math.round(
    events.reduce((sum, e) => sum + e.duration, 0) / 60,
  );
}

export function getActiveDays(): number {
  const days = new Set<string>();
  loadEvents().forEach(e => days.add(e.timestamp.slice(0, 10)));
  return days.size;
}

export function getAccuracy(): number {
  const correct = getEventsByType('answer_correct').length;
  const incorrect = getEventsByType('answer_incorrect').length;
  const total = correct + incorrect;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function getWeakPhonemes(): Array<{ phonemeId: string; errorCount: number }> {
  const errors: Record<string, number> = {};
  getEventsByType('answer_incorrect').forEach(e => {
    const pid = (e.payload.phonemeId as string) || e.relatedId;
    if (pid) errors[pid] = (errors[pid] || 0) + 1;
  });
  return Object.entries(errors)
    .map(([phonemeId, errorCount]) => ({ phonemeId, errorCount }))
    .sort((a, b) => b.errorCount - a.errorCount);
}
