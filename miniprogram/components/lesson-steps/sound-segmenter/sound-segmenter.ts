/**
 * 单词拆音步骤 - 按顺序选择音素拆解单词
 */
import { getWordById } from '../../../services/course';

Component({
  properties: { step: { type: Object, value: {} }, lesson: { type: Object, value: {} }, state: { type: Object, value: {} } },
  data: {
    words: [] as Array<{ text: string; phonemeIds: string[]; options: string[] }>,
    currentIdx: 0,
    selectedPhonemes: [] as string[],
    showResult: false,
    isCorrect: false,
    completed: false,
    error: '',
  },
  lifetimes: { attached() { this.loadWords(); } },
  methods: {
    loadWords() {
      const wordIds = this.properties.lesson?.targetWordIds || [];
      const words = wordIds.map((id: string) => {
        const w = getWordById(id);
        if (!w) return null;
        const phonemeIds = w.phonemeIds;
        const distractors = ['ph_a','ph_e','ph_i','ph_o','ph_u'].filter(id => !phonemeIds.includes(id)).slice(0,2);
        return { text: w.text, phonemeIds, options: [...phonemeIds, ...distractors].sort(() => Math.random() - 0.5) };
      }).filter((x: any) => x != null).slice(0,3);
      if (words.length === 0) {
        this.setData({ words: [
          { text:'sit', phonemeIds:['ph_s','ph_i','ph_t'], options:['ph_s','ph_i','ph_t','ph_a','ph_e'] },
          { text:'sat', phonemeIds:['ph_s','ph_a','ph_t'], options:['ph_s','ph_a','ph_t','ph_i','ph_e'] },
          { text:'sun', phonemeIds:['ph_s','ph_u','ph_n'], options:['ph_s','ph_u','ph_n','ph_a','ph_i'] },
        ] });
      } else { this.setData({ words: words as any }); }
    },
    onSelectPhoneme(e: WechatMiniprogram.BaseEvent) {
      const { id } = e.currentTarget.dataset;
      const { selectedPhonemes, words, currentIdx } = this.data;
      if (selectedPhonemes.length >= words[currentIdx].phonemeIds.length) return;
      this.setData({ selectedPhonemes: [...selectedPhonemes, id] });
    },
    onUndo() { this.setData({ selectedPhonemes: this.data.selectedPhonemes.slice(0, -1) }); },
    onReset() { this.setData({ selectedPhonemes: [], showResult: false }); },
    onSubmit() {
      const { words, currentIdx, selectedPhonemes } = this.data;
      const isCorrect = JSON.stringify(selectedPhonemes) === JSON.stringify(words[currentIdx].phonemeIds);
      this.setData({ showResult: true, isCorrect });
      if (isCorrect) {
        setTimeout(() => { const next = currentIdx + 1;
          if (next >= words.length) { this.setData({ completed: true }); this.triggerEvent('complete', { passed: true, score: 100, attempts: 1, duration: 0 }); }
          else { this.setData({ currentIdx: next, selectedPhonemes: [], showResult: false }); }
        }, 800);
      }
    },
  },
});
