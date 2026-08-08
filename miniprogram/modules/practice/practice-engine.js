"use strict";
/**
 * 练习引擎
 * 管理练习会话的生命周期：创建、答题、前进、结果
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeEngine = exports.practiceEngine = void 0;
const question_generator_1 = require("./question-generator");
const event_bus_1 = require("../../utils/event-bus");
function generateSessionId() {
    return `prac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
class PracticeEngine {
    constructor() {
        this.session = null;
    }
    /** 开始新练习会话 */
    startSession(mode) {
        const questions = (0, question_generator_1.getQuestions)(mode);
        const session = {
            sessionId: generateSessionId(),
            mode,
            questions,
            currentIndex: 0,
            answers: [],
            startedAt: new Date().toISOString(),
            status: 'in_progress',
        };
        this.session = session;
        event_bus_1.eventBus.emit('practice_started', {
            mode,
            sessionId: session.sessionId,
            questionCount: questions.length,
        });
        return session;
    }
    /** 获取当前题目 */
    getCurrentQuestion() {
        if (!this.session || this.session.status !== 'in_progress')
            return null;
        return this.session.questions[this.session.currentIndex] || null;
    }
    /** 回答当前题目 */
    answerQuestion(selectedIndex) {
        if (!this.session)
            throw new Error('未开始练习');
        const q = this.session.questions[this.session.currentIndex];
        const correct = q.correctIndex === selectedIndex;
        const answer = {
            questionId: q.id,
            selectedIndex,
            correct,
            timeSpent: 0,
        };
        this.session.answers.push(answer);
        event_bus_1.eventBus.emit('practice_answered', {
            sessionId: this.session.sessionId,
            questionId: q.id,
            correct,
        });
        return { correct, explanation: q.explanation };
    }
    /** 前进到下一题，返回 false 表示已是最后一题 */
    nextQuestion() {
        if (!this.session)
            return false;
        const nextIndex = this.session.currentIndex + 1;
        if (nextIndex >= this.session.questions.length) {
            this.session.status = 'completed';
            event_bus_1.eventBus.emit('practice_completed', {
                sessionId: this.session.sessionId,
                mode: this.session.mode,
                ...this.getResults(),
            });
            return false;
        }
        this.session.currentIndex = nextIndex;
        return true;
    }
    /** 获取练习结果 */
    getResults() {
        if (!this.session)
            return { total: 0, correct: 0, score: 0, answers: [] };
        const total = this.session.answers.length;
        const correct = this.session.answers.filter(a => a.correct).length;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
        return { total, correct, score, answers: this.session.answers };
    }
    /** 获取当前会话 */
    getSession() {
        return this.session;
    }
    /** 重置引擎 */
    reset() {
        this.session = null;
    }
}
exports.PracticeEngine = PracticeEngine;
exports.practiceEngine = new PracticeEngine();
//# sourceMappingURL=practice-engine.js.map