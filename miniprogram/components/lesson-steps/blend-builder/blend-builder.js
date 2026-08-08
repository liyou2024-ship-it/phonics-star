"use strict";
/**
 * 拼读合成步骤组件
 * 点击音块依次选择 → 连起来读 → 组成目标单词
 */
Object.defineProperty(exports, "__esModule", { value: true });
const course_1 = require("../../../services/course");
const audio_1 = require("../../../services/audio");
Component({
    properties: {
        step: { type: Object, value: {} },
        lesson: { type: Object, value: {} },
        state: { type: Object, value: { status: 'not_started' } },
    },
    data: {
        targetWords: [],
        currentWordIndex: 0,
        selectedIndices: [],
        allPhonemes: [],
        displayPhonemes: [],
        blended: false,
        completed: false,
        error: '',
    },
    lifetimes: {
        attached() {
            this.loadWords();
        },
    },
    methods: {
        rebuildDisplayPhonemes() {
            const { targetWords, currentWordIndex, selectedIndices } = this.data;
            const word = targetWords[currentWordIndex];
            if (!word) {
                this.setData({ displayPhonemes: [] });
                return;
            }
            const displayPhonemes = word.phonemes.map((p, i) => ({ ...p, selected: selectedIndices.indexOf(i) > -1 }));
            this.setData({ displayPhonemes });
        },
        loadWords() {
            const { lesson } = this.properties;
            const wordIds = lesson?.targetWordIds || [];
            const words = wordIds
                .map((id) => (0, course_1.getWordById)(id))
                .filter((w) => !!w && !!w.phonemeIds)
                .slice(0, 3);
            if (words.length === 0) {
                // 兜底数据：sit, sat, sun
                this.setData({
                    targetWords: [
                        { text: 'sit', phonemes: [{ letter: 's', sound: '/s/' }, { letter: 'i', sound: '/ɪ/' }, { letter: 't', sound: '/t/' }], sounds: ['/s/', '/ɪ/', '/t/'] },
                        { text: 'sat', phonemes: [{ letter: 's', sound: '/s/' }, { letter: 'a', sound: '/æ/' }, { letter: 't', sound: '/t/' }], sounds: ['/s/', '/æ/', '/t/'] },
                        { text: 'sun', phonemes: [{ letter: 's', sound: '/s/' }, { letter: 'u', sound: '/ʌ/' }, { letter: 'n', sound: '/n/' }], sounds: ['/s/', '/ʌ/', '/n/'] },
                    ],
                });
                this.rebuildDisplayPhonemes();
                return;
            }
            const targetWords = words.map((w) => ({
                text: w.text,
                phonemes: w.phonemeIds.map((pId, i) => ({
                    letter: w.text[i] || '?',
                    sound: `/ /`,
                })),
                sounds: w.phonemeIds.map(() => '/ /'),
            }));
            this.setData({ targetWords });
            this.rebuildDisplayPhonemes();
        },
        /** 选择音块 */
        onSelectPhoneme(e) {
            const { index } = e.currentTarget.dataset;
            const { selectedIndices, allPhonemes } = this.data;
            const currentWord = this.data.targetWords[this.data.currentWordIndex];
            if (selectedIndices.length >= currentWord.phonemes.length)
                return;
            if (selectedIndices.includes(index))
                return;
            const newSelected = [...selectedIndices, index];
            this.setData({ selectedIndices: newSelected });
            this.rebuildDisplayPhonemes();
            // 点击时播放对应声音（如果有音频）
            if (allPhonemes[index]?.sound) {
                try {
                    audio_1.audio.play('');
                }
                catch { /* 无音频 */ }
            }
        },
        /** 连起来读 */
        onBlend() {
            const { selectedIndices, allPhonemes } = this.data;
            if (selectedIndices.length === 0)
                return;
            this.setData({ blended: true });
            // 播放合成结果提示
            const word = selectedIndices.map(i => allPhonemes[i]?.letter || '').join('');
            wx.showToast({ title: word, icon: 'none', duration: 1500 });
            // 检查是否正确
            const currentWord = this.data.targetWords[this.data.currentWordIndex];
            const built = selectedIndices.map(i => allPhonemes[i]?.letter || '').join('');
            if (built === currentWord.text) {
                wx.showToast({ title: '✅ 拼对了！', icon: 'success' });
                this.nextWord();
            }
        },
        /** 重置 */
        onReset() {
            this.setData({ selectedIndices: [], blended: false });
            this.rebuildDisplayPhonemes();
        },
        /** 下一词 */
        nextWord() {
            const next = this.data.currentWordIndex + 1;
            if (next >= this.data.targetWords.length) {
                this.setData({ completed: true });
                this.triggerEvent('complete', {
                    passed: true,
                    score: 100,
                    attempts: 1,
                    duration: 0,
                    data: { wordsCompleted: this.data.targetWords.length },
                });
                return;
            }
            setTimeout(() => {
                this.setData({
                    currentWordIndex: next,
                    selectedIndices: [],
                    blended: false,
                });
                this.rebuildDisplayPhonemes();
            }, 800);
        },
    },
});
//# sourceMappingURL=blend-builder.js.map