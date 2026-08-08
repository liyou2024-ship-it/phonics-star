"use strict";
/**
 * 音频播放服务
 * 封装 wx.createInnerAudioContext()
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.audio = void 0;
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = wx.createInnerAudioContext();
        audioCtx.obeyMuteSwitch = false; // 不遵循静音开关（学习场景需要）
    }
    return audioCtx;
}
exports.audio = {
    /** 播放音频 */
    play(src) {
        return new Promise((resolve, reject) => {
            const ctx = getAudioContext();
            ctx.src = src;
            const onEnded = () => {
                ctx.offEnded(onEnded);
                ctx.offError(onError);
                resolve();
            };
            const onError = (err) => {
                ctx.offEnded(onEnded);
                ctx.offError(onError);
                reject(new Error(err.errMsg));
            };
            ctx.onEnded(onEnded);
            ctx.onError(onError);
            ctx.play();
        });
    },
    /** 暂停 */
    pause() {
        getAudioContext().pause();
    },
    /** 停止 */
    stop() {
        const ctx = getAudioContext();
        ctx.stop();
        ctx.destroy();
        audioCtx = null;
    },
    /** 是否播放中 */
    isPlaying() {
        return audioCtx ? !audioCtx.paused : false;
    },
    /** 设置音量 0-1 */
    setVolume(volume) {
        getAudioContext().volume = Math.max(0, Math.min(1, volume));
    },
};
//# sourceMappingURL=audio.js.map