"use strict";
/**
 * 可解码阅读步骤组件
 * 逐句展示阅读内容，单词可点击，跟踪阅读进度
 */
Object.defineProperty(exports, "__esModule", { value: true });
const course_1 = require("../../../services/course");
Component({
    properties: {
        step: { type: Object, value: {} },
        lesson: { type: Object, value: {} },
        state: { type: Object, value: { status: 'not_started' } },
    },
    data: {
        reader: null,
        sentences: [],
        sightWords: [],
        highlightedWordIndex: -1,
        readComplete: false,
        clickedWordCount: 0,
        totalWords: 0,
        error: '',
    },
    lifetimes: {
        attached() {
            this.loadReader();
        },
    },
    methods: {
        loadReader() {
            const readerId = this.properties.step?.content?.readerId;
            if (!readerId) {
                this.setData({ error: '缺少读物ID' });
                return;
            }
            const reader = (0, course_1.getReaderById)(readerId);
            if (!reader) {
                this.setData({
                    error: '读物数据不存在',
                    // 兜底数据
                    sentences: this.buildFallbackSentences([
                        'The cat sat on the mat.',
                        'The dog ran to the log.',
                        'I see a big red bug.',
                    ]),
                    sightWords: ['the', 'on', 'to', 'a', 'I', 'see'],
                    totalWords: 15,
                });
                return;
            }
            const sentences = this.buildSentences(reader.sentences);
            const totalWords = sentences.reduce((sum, s) => sum + s.words.length, 0);
            this.setData({
                reader,
                sentences,
                sightWords: reader.rules || ['the', 'on', 'to'],
                totalWords,
            });
        },
        buildSentences(raw) {
            return raw.map((text) => ({
                original: text,
                words: text.split(/\s+/).map((w, i) => ({
                    text: w,
                    clicked: false,
                    index: i,
                })),
                read: false,
            }));
        },
        buildFallbackSentences(raw) {
            return this.buildSentences(raw);
        },
        /** 点击单词 */
        onReadWord(e) {
            const { word, sentenceIdx, wordIdx } = e.currentTarget.dataset;
            if (!word)
                return;
            // 尝试播放音频
            this.playWordAudio(word);
            // 标记已点击
            const sentences = this.data.sentences.map((s, si) => {
                if (si !== sentenceIdx)
                    return s;
                return {
                    ...s,
                    words: s.words.map((w, wi) => wi === wordIdx ? { ...w, clicked: true } : w),
                };
            });
            const clickedWordCount = this.data.clickedWordCount + 1;
            this.setData({
                sentences,
                highlightedWordIndex: wordIdx,
                clickedWordCount,
            });
            // 清除高亮
            setTimeout(() => {
                this.setData({ highlightedWordIndex: -1 });
            }, 600);
        },
        /** 阅读整句 */
        onReadSentence(e) {
            const { index } = e.currentTarget.dataset;
            const sentence = this.data.sentences[index];
            if (!sentence)
                return;
            // 标记该句所有单词为已点击
            const sentences = this.data.sentences.map((s, si) => {
                if (si !== index)
                    return s;
                return {
                    ...s,
                    read: true,
                    words: s.words.map(w => ({ ...w, clicked: true })),
                };
            });
            const clickedWordCount = sentences.reduce((sum, s) => sum + s.words.filter(w => w.clicked).length, 0);
            this.setData({ sentences, clickedWordCount });
        },
        /** 播放单词音频 */
        playWordAudio(word) {
            // 单词音频暂用 Toast 代替（项目中音频资源未索引化）
            wx.showToast({
                title: `🔊 ${word}`,
                icon: 'none',
                duration: 800,
            });
        },
        /** 完成阅读 */
        onComplete() {
            const { sentences } = this.data;
            const allRead = sentences.every(s => s.words.every(w => w.clicked));
            if (!allRead) {
                wx.showToast({ title: '请点完所有单词再完成', icon: 'none' });
                return;
            }
            this.setData({ readComplete: true });
            this.triggerEvent('complete', {
                passed: true,
                score: 100,
                attempts: 1,
                duration: 0,
                data: {
                    readerId: this.properties.step?.content?.readerId,
                    wordsRead: this.data.clickedWordCount,
                    totalWords: this.data.totalWords,
                },
            });
        },
    },
});
//# sourceMappingURL=decodable-reader.js.map