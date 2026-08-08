"use strict";
/**
 * 分析服务
 * 记录学习事件并提供统计查询
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordEvent = recordEvent;
exports.getEventsByDate = getEventsByDate;
exports.getEventsByType = getEventsByType;
exports.getStudyDuration = getStudyDuration;
exports.getActiveDays = getActiveDays;
exports.getAccuracy = getAccuracy;
exports.getWeakPhonemes = getWeakPhonemes;
const storage_1 = require("./storage");
const STORAGE_KEY = 'analytics_events';
const SESSION_KEY = 'analytics_session';
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}
function getSessionId() {
    let sessionId = storage_1.storage.get(SESSION_KEY);
    if (!sessionId) {
        sessionId = uuid();
        storage_1.storage.set(SESSION_KEY, sessionId);
    }
    return sessionId;
}
function loadEvents() {
    return storage_1.storage.get(STORAGE_KEY) || [];
}
function saveEvents(events) {
    // Keep last 10,000 events
    if (events.length > 10000) {
        events = events.slice(events.length - 10000);
    }
    storage_1.storage.set(STORAGE_KEY, events);
}
function recordEvent(eventType, data = {}) {
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
function getEventsByDate(date) {
    return loadEvents().filter(e => e.timestamp.startsWith(date));
}
function getEventsByType(eventType) {
    return loadEvents().filter(e => e.eventType === eventType);
}
function getStudyDuration(date) {
    const events = getEventsByDate(date);
    return Math.round(events.reduce((sum, e) => sum + e.duration, 0) / 60);
}
function getActiveDays() {
    const days = new Set();
    loadEvents().forEach(e => days.add(e.timestamp.slice(0, 10)));
    return days.size;
}
function getAccuracy() {
    const correct = getEventsByType('answer_correct').length;
    const incorrect = getEventsByType('answer_incorrect').length;
    const total = correct + incorrect;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
}
function getWeakPhonemes() {
    const errors = {};
    getEventsByType('answer_incorrect').forEach(e => {
        const pid = e.payload.phonemeId || e.relatedId;
        if (pid)
            errors[pid] = (errors[pid] || 0) + 1;
    });
    return Object.entries(errors)
        .map(([phonemeId, errorCount]) => ({ phonemeId, errorCount }))
        .sort((a, b) => b.errorCount - a.errorCount);
}
//# sourceMappingURL=analytics.js.map