/**
 * 发音认识步骤组件
 * 展示字母、发音符号、口型提示、示例词，点击播放音频
 */

import { getPhonemeById, getWordById } from '../../../services/course';
import { audio } from '../../../services/audio';

Component({
  properties: {
    step: { type: Object, value: {} },
    lesson: { type: Object, value: {} },
    state: { type: Object, value: { status: 'not_started' } },
  },

  data: {
    phoneme: null as any,
    words: [] as any[],
    displayLetter: '',
    hasPlayed: false,
    loading: false,
    error: '',
  },

  lifetimes: {
    attached() {
      this.loadPhonemeData();
    },
  },

  methods: {
    loadPhonemeData() {
      const { step } = this.properties;
      const phonemeId = step?.content?.phonemeId as string;
      if (!phonemeId) {
        this.setData({ error: '缺少音素ID配置' });
        return;
      }

      const phoneme = getPhonemeById(phonemeId);
      if (!phoneme) {
        this.setData({ error: '音素数据不存在' });
        return;
      }

      // 加载示例词
      const words = (phoneme.exampleWordIds || [])
        .map((id: string) => getWordById(id))
        .filter((x): x is NonNullable<typeof x> => x != null)
        .slice(0, 3);

      this.setData({
        phoneme,
        words,
        displayLetter: (phoneme.displayName || '').slice(-1).toUpperCase(),
      });
    },

    /** 播放音素音频 */
    onPlaySound() {
      const { phoneme } = this.data;
      if (!phoneme) return;

      const audioUrl = (phoneme as any).audioUrl;
      if (!audioUrl) {
        wx.showToast({ title: '音频资源待配置', icon: 'none' });
        return;
      }

      audio.play(audioUrl).catch(() => {
        wx.showToast({ title: '音频资源待配置', icon: 'none' });
      });

      this.setData({ hasPlayed: true });
    },

    /** 播放单词音频 */
    onPlayWord(e: WechatMiniprogram.BaseEvent) {
      const { word } = e.currentTarget.dataset;
      if (!word?.audioUrl) {
        wx.showToast({ title: '音频资源待配置', icon: 'none' });
        return;
      }

      audio.play(word.audioUrl).catch(() => {
        wx.showToast({ title: '音频资源待配置', icon: 'none' });
      });
    },

    /** 完成步骤 */
    onComplete() {
      if (!this.data.hasPlayed) {
        wx.showToast({ title: '请先听一次发音', icon: 'none' });
        return;
      }

      this.triggerEvent('complete', {
        passed: true,
        score: 100,
        attempts: 1,
        duration: 0,
      });
    },
  },
});
