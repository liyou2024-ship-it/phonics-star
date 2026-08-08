"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const practice_engine_1 = require("../../modules/practice/practice-engine");
const practice_session_1 = require("../../modules/practice/practice-session");
const routes_1 = require("../../config/routes");
const MODES = [
    { key: 'listen', icon: '\u{1F442}', label: '听音辨字母' },
    { key: 'spell', icon: '\u{270D}\u{FE0F}', label: '听音拼单词' },
    { key: 'family', icon: '\u{1F4D6}', label: '词族训练' },
    { key: 'error_review', icon: '\u{1F527}', label: '错音复习' },
];
Page({
    data: {
        modes: MODES,
        activeMode: 'listen',
        phase: 'select',
        loading: false,
        error: '',
        currentQuestion: null,
        answered: false,
        selectedAnswerIndex: -1,
        isCorrect: null,
        explanation: '',
        feedbackClass: '',
        progress: '',
        progressPercent: 0,
        results: { total: 0, correct: 0, score: 0 },
    },
    /** 切换模式 tab */
    onModeTap(e) {
        const { key } = e.currentTarget.dataset;
        const phase = key === 'error_review' ? 'select' : 'select';
        this.setData({ activeMode: key, phase, error: '', answered: false });
    },
    /** 开始练习 */
    onStartPractice() {
        const { activeMode } = this.data;
        this.setData({ loading: true, error: '' });
        try {
            const session = practice_engine_1.practiceEngine.startSession(activeMode);
            if (!session.questions || session.questions.length === 0) {
                if (activeMode === 'error_review') {
                    this.setData({ phase: 'empty', loading: false });
                    return;
                }
                this.setData({ error: '暂无题目', loading: false });
                return;
            }
            (0, practice_session_1.saveSession)(session);
            const q = practice_engine_1.practiceEngine.getCurrentQuestion();
            this.setData({
                phase: 'question',
                loading: false,
                currentQuestion: q,
                answered: false,
                isCorrect: null,
                explanation: '',
                feedbackClass: '',
                progress: `1/${session.questions.length}`,
                progressPercent: Math.round(100 / session.questions.length),
            });
        }
        catch (err) {
            this.setData({
                loading: false,
                error: err.message || '开始练习失败',
            });
        }
    },
    /** 选择答案 */
    onOptionTap(e) {
        if (this.data.answered)
            return;
        const { index } = e.currentTarget.dataset;
        const { correct, explanation } = practice_engine_1.practiceEngine.answerQuestion(index);
        this.setData({
            answered: true,
            selectedAnswerIndex: index,
            isCorrect: correct,
            explanation,
            feedbackClass: correct ? 'feedback-correct' : 'feedback-wrong',
        });
    },
    /** 下一题 */
    onNextQuestion() {
        const hasNext = practice_engine_1.practiceEngine.nextQuestion();
        if (!hasNext) {
            const session = practice_engine_1.practiceEngine.getSession();
            const results = practice_engine_1.practiceEngine.getResults();
            this.setData({
                phase: 'result',
                results,
            });
            return;
        }
        const session = practice_engine_1.practiceEngine.getSession();
        (0, practice_session_1.saveSession)(session);
        const q = practice_engine_1.practiceEngine.getCurrentQuestion();
        this.setData({
            currentQuestion: q,
            answered: false,
            selectedAnswerIndex: -1,
            isCorrect: null,
            explanation: '',
            feedbackClass: '',
            progress: session ? `${session.currentIndex + 1}/${session.questions.length}` : '',
            progressPercent: session ? Math.round(((session.currentIndex + 1) / session.questions.length) * 100) : 0,
        });
    },
    /** 再练一次 */
    onRetry() {
        practice_engine_1.practiceEngine.reset();
        this.setData({ phase: 'select', error: '' });
    },
    /** 错题重做 */
    onErrorReview() {
        practice_engine_1.practiceEngine.reset();
        this.setData({ activeMode: 'error_review', phase: 'select', error: '' });
    },
    /** 去做练习（空状态） */
    onGoPractice() {
        practice_engine_1.practiceEngine.reset();
        this.setData({ activeMode: 'listen', phase: 'select', error: '' });
    },
    /** 播放音频 */
    onPlayAudio() {
        const { currentQuestion } = this.data;
        if (!currentQuestion?.audioUrl) {
            wx.showToast({ title: '音频资源待配置', icon: 'none' });
            return;
        }
        const audio = wx.createInnerAudioContext();
        audio.src = currentQuestion.audioUrl;
        audio.play();
        audio.onError(() => {
            wx.showToast({ title: '音频资源待配置', icon: 'none' });
        });
    },
    /** loading 重试 */
    onRetryLoad() {
        this.onStartPractice();
    },
    onTabChange(e) {
        const { tab } = e.detail;
        const routeMap = {
            home: routes_1.ROUTES.HOME,
            course: routes_1.ROUTES.COURSE_MAP,
            practice: routes_1.ROUTES.PRACTICE,
            growth: routes_1.ROUTES.GROWTH,
            profile: routes_1.ROUTES.PROFILE,
        };
        const route = routeMap[tab];
        if (route && route !== routes_1.ROUTES.PRACTICE)
            wx.redirectTo({ url: route });
    },
});
//# sourceMappingURL=practice.js.map