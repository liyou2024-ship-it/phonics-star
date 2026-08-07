/**
 * 音频播放服务
 * 封装 wx.createInnerAudioContext()
 */

let audioCtx: WechatMiniprogram.InnerAudioContext | null = null;

function getAudioContext(): WechatMiniprogram.InnerAudioContext {
  if (!audioCtx) {
    audioCtx = wx.createInnerAudioContext();
    audioCtx.obeyMuteSwitch = false; // 不遵循静音开关（学习场景需要）
  }
  return audioCtx;
}

export const audio = {
  /** 播放音频 */
  play(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ctx = getAudioContext();
      ctx.src = src;

      const onEnded = () => {
        ctx.offEnded(onEnded);
        ctx.offError(onError);
        resolve();
      };

      const onError = (err: any) => {
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
  pause(): void {
    getAudioContext().pause();
  },

  /** 停止 */
  stop(): void {
    const ctx = getAudioContext();
    ctx.stop();
    ctx.destroy();
    audioCtx = null;
  },

  /** 是否播放中 */
  isPlaying(): boolean {
    return audioCtx ? !audioCtx.paused : false;
  },

  /** 设置音量 0-1 */
  setVolume(volume: number): void {
    getAudioContext().volume = Math.max(0, Math.min(1, volume));
  },
};
