"use strict";
/**
 * 跟读练习步骤组件
 * 录音 → 回放 → 评测 → 查看结果
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mock_evaluator_1 = require("../../../modules/speech/mock-evaluator");
let recorderManager = null;
let playbackCtx = null;
let durationTimer = null;
function getRecorder() {
    if (!recorderManager) {
        recorderManager = wx.getRecorderManager();
    }
    return recorderManager;
}
function getPlayback() {
    if (!playbackCtx) {
        playbackCtx = wx.createInnerAudioContext();
    }
    return playbackCtx;
}
Component({
    properties: {
        step: { type: Object, value: {} },
        lesson: { type: Object, value: {} },
        state: { type: Object, value: { status: 'not_started' } },
    },
    data: {
        isRecording: false,
        recordDuration: 0,
        tempFilePath: '',
        evaluating: false,
        evalResult: null,
        hasRecorded: false,
    },
    lifetimes: {
        attached() {
            // no-op: init handled on user action
        },
        detached() {
            this.clearTimer();
            if (playbackCtx) {
                playbackCtx.destroy();
                playbackCtx = null;
            }
        },
    },
    methods: {
        /** 开始录音 */
        onStartRecord() {
            const recorder = getRecorder();
            recorder.onStop((res) => {
                this.clearTimer();
                this.setData({
                    isRecording: false,
                    tempFilePath: res.tempFilePath,
                    hasRecorded: true,
                    recordDuration: Math.floor(res.duration / 1000),
                });
            });
            recorder.onError((err) => {
                this.clearTimer();
                this.setData({ isRecording: false });
                wx.showToast({ title: '录音失败，请重试', icon: 'none' });
                console.error('Recorder error:', err);
            });
            recorder.start({
                duration: 15000,
                sampleRate: 16000,
                numberOfChannels: 1,
                encodeBitRate: 48000,
                format: 'mp3',
            });
            this.setData({ isRecording: true, recordDuration: 0 });
            durationTimer = setInterval(() => {
                this.setData({ recordDuration: this.data.recordDuration + 1 });
            }, 1000);
        },
        /** 停止录音 */
        onStopRecord() {
            getRecorder().stop();
        },
        /** 播放录音 */
        onPlayRecord() {
            const { tempFilePath } = this.data;
            if (!tempFilePath) {
                wx.showToast({ title: '请先录音', icon: 'none' });
                return;
            }
            const ctx = getPlayback();
            ctx.src = tempFilePath;
            ctx.play();
        },
        /** 开始评测 */
        async onEvaluate() {
            const { tempFilePath } = this.data;
            if (!tempFilePath) {
                wx.showToast({ title: '请先录音', icon: 'none' });
                return;
            }
            this.setData({ evaluating: true });
            try {
                const evaluator = (0, mock_evaluator_1.getMockEvaluator)();
                const targetWord = this.properties.step?.content?.targetWord || 'cat';
                const result = await evaluator.evaluate(tempFilePath, targetWord);
                this.setData({
                    evaluating: false,
                    evalResult: result,
                });
            }
            catch (err) {
                this.setData({ evaluating: false });
                wx.showToast({ title: '评测失败，请重试', icon: 'none' });
                console.error('Evaluate error:', err);
            }
        },
        /** 重试 */
        onRetry() {
            this.setData({
                isRecording: false,
                recordDuration: 0,
                tempFilePath: '',
                evaluating: false,
                evalResult: null,
                hasRecorded: false,
            });
        },
        /** 完成步骤 */
        onComplete() {
            const { evalResult, recordDuration } = this.data;
            if (!evalResult) {
                wx.showToast({ title: '请先完成评测', icon: 'none' });
                return;
            }
            this.triggerEvent('complete', {
                passed: evalResult.overallScore >= 60,
                score: evalResult.overallScore,
                attempts: 1,
                duration: recordDuration * 1000,
                data: { evalResult },
            });
        },
        clearTimer() {
            if (durationTimer) {
                clearInterval(durationTimer);
                durationTimer = null;
            }
        },
    },
});
//# sourceMappingURL=pronunciation-practice.js.map