"use strict";
/**
 * 听音选择步骤组件
 * 播放声音 → 从选项中选出对应字母
 */
Object.defineProperty(exports, "__esModule", { value: true });
const audio_1 = require("../../../services/audio");
const course_1 = require("../../../services/course");
const random_1 = require("../../../utils/random");
Component({
    properties: {
        step: { type: Object, value: {} },
        lesson: { type: Object, value: {} },
        state: { type: Object, value: { status: 'not_started' } },
    },
    data: {
        questions: [],
        currentQuestionIndex: 0,
        selectedIndex: -1,
        showResult: false,
        isCorrect: false,
        attempts: 0,
        correctCount: 0,
        completed: false,
        loading: false,
        error: '',
    },
    lifetimes: {
        attached() {
            this.generateQuestions();
        },
    },
    methods: {
        generateQuestions() {
            const { lesson } = this.properties;
            const phonemeIds = lesson?.targetPhonemeIds || [];
            if (phonemeIds.length === 0) {
                this.setData({ error: '没有目标音素数据' });
                return;
            }
            // 生成 3 道题
            const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
            const questions = [];
            for (let i = 0; i < Math.min(3, phonemeIds.length); i++) {
                const phoneme = (0, course_1.getPhonemeById)(phonemeIds[i]);
                if (!phoneme)
                    continue;
                const correctLetter = phoneme.displayName.slice(-1).toLowerCase();
                const distractorLetters = allLetters
                    .filter(l => l !== correctLetter)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);
                const letterOpts = (0, random_1.shuffle)([correctLetter, ...distractorLetters]);
                const options = letterOpts.map(l => ({ letter: l.toUpperCase(), sound: l }));
                const correctIndex = letterOpts.indexOf(correctLetter);
                questions.push({ phonemeId: phonemeIds[i], options, correctIndex });
            }
            if (questions.length === 0) {
                // 兜底：生成默认题目
                questions.push({ phonemeId: 'ph_s', options: [{ letter: 'S', sound: 's' }, { letter: 'M', sound: 'm' }, { letter: 'T', sound: 't' }, { letter: 'A', sound: 'a' }], correctIndex: 0 }, { phonemeId: 'ph_s', options: [{ letter: 'P', sound: 'p' }, { letter: 'S', sound: 's' }, { letter: 'K', sound: 'k' }, { letter: 'E', sound: 'e' }], correctIndex: 1 }, { phonemeId: 'ph_s', options: [{ letter: 'T', sound: 't' }, { letter: 'M', sound: 'm' }, { letter: 'S', sound: 's' }, { letter: 'R', sound: 'r' }], correctIndex: 2 });
            }
            this.setData({ questions });
        },
        /** 播放当前题目音频 */
        onPlayAudio() {
            const { questions, currentQuestionIndex } = this.data;
            const question = questions[currentQuestionIndex];
            if (!question)
                return;
            const phoneme = (0, course_1.getPhonemeById)(question.phonemeId);
            if (!phoneme || !phoneme.audioUrl) {
                wx.showToast({ title: '音频资源待配置', icon: 'none' });
                return;
            }
            audio_1.audio.play(phoneme.audioUrl).catch(() => {
                wx.showToast({ title: '音频资源待配置', icon: 'none' });
            });
        },
        /** 选择答案 */
        onSelect(e) {
            if (this.data.showResult)
                return;
            const { index } = e.currentTarget.dataset;
            const { questions, currentQuestionIndex, attempts } = this.data;
            const question = questions[currentQuestionIndex];
            const isCorrect = index === question.correctIndex;
            const newAttempts = attempts + 1;
            this.setData({
                selectedIndex: index,
                showResult: true,
                isCorrect,
                attempts: newAttempts,
                correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount,
            });
            if (!isCorrect && newAttempts < 3) {
                // 允许重试
                setTimeout(() => {
                    this.setData({ selectedIndex: -1, showResult: false });
                }, 1200);
            }
            else {
                // 完成本题
                setTimeout(() => {
                    this.nextQuestion();
                }, 1000);
            }
        },
        /** 下一题 */
        nextQuestion() {
            const { currentQuestionIndex, questions } = this.data;
            const next = currentQuestionIndex + 1;
            if (next >= questions.length) {
                // 所有题目完成
                const score = Math.round((this.data.correctCount / questions.length) * 100);
                this.setData({ completed: true });
                this.triggerEvent('complete', {
                    passed: this.data.correctCount >= 2,
                    score,
                    attempts: this.data.attempts,
                    duration: 0,
                    data: { correctCount: this.data.correctCount, totalCount: questions.length },
                });
                return;
            }
            this.setData({
                currentQuestionIndex: next,
                selectedIndex: -1,
                showResult: false,
                isCorrect: false,
            });
        },
    },
});
//# sourceMappingURL=audio-choice.js.map