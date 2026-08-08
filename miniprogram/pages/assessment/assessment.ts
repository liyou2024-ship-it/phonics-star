/**
 * 单元测试页面
 * 听音辨字母 + 看词拼读 + 拆音 + 阅读理解的综合测评
 */
import { storage } from '../../services/storage';
import { eventBus } from '../../utils/event-bus';
import { getPhonemeById } from '../../services/course';
import { audio } from '../../services/audio';

interface Question {
  type: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  /** 听音题的音频（音素发音），如 /assets/audio/phonemes/s.mp3 */
  audioUrl?: string;
}

Page({
  data: {
    questions: [] as Question[],
    currentIndex: 0,
    answers: [] as { correct: boolean; timeSpent: number }[],
    phase: 'intro' as 'intro' | 'testing' | 'result',
    score: 0,
    correctCount: 0,
    startTime: 0,
    result: null as any,
  },

  onLoad() {
    this.generateQuestions();
  },

  generateQuestions() {
    const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const targetLetters = ['s','a','t','p','i'];
    const questions: Question[] = [];

    // 听音辨字母 (6题)
    for (let i = 0; i < 6; i++) {
      const letter = targetLetters[i % 5];
      const upper = letter.toUpperCase();
      const others = allLetters.filter(l => l !== letter).sort(() => Math.random() - 0.5).slice(0, 3).map(l => l.toUpperCase());
      const options = [upper, ...others].sort(() => Math.random() - 0.5);
      questions.push({
        type: 'sound_to_letter',
        prompt: `听到声音后选择正确的字母（${upper}）`,
        options,
        correctIndex: options.indexOf(upper),
        audioUrl: `/assets/audio/phonemes/${letter}.mp3`,
      });
    }

    // 拼读合成 (2题)
    const blendWords = [
      { word: 'sat', letters: ['s','a','t'], distractors: ['p','i'] },
      { word: 'tip', letters: ['t','i','p'], distractors: ['s','a'] },
    ];
    blendWords.forEach(w => {
      const options = [...w.letters, ...w.distractors].map(l => l.toUpperCase()).sort(() => Math.random() - 0.5);
      questions.push({
        type: 'blend_word',
        prompt: `选出组成 "${w.word}" 的字母（按顺序）`,
        options,
        correctIndex: -1, // 多选，需特殊处理
      });
    });

    // 拆音 (2题)
    const segmentWords = ['sit', 'pat'];
    segmentWords.forEach(w => {
      const letters = w.split('').map(l => l.toUpperCase());
      const distractors = ['x','m','k'].filter(l => !letters.includes(l));
      const options = [...letters, ...distractors].sort(() => Math.random() - 0.5);
      questions.push({
        type: 'segment_word',
        prompt: `"${w}" 包含哪些音？选择正确的字母组合`,
        options,
        correctIndex: -1,
      });
    });

    this.setData({ questions });
  },

  /** 播放当前题目的音频（仅 sound_to_letter 听音题有 audioUrl） */
  playCurrentAudio() {
    const q = this.data.questions[this.data.currentIndex] as any;
    if (q && q.audioUrl) {
      audio.play(q.audioUrl).catch(() => {});
    }
  },

  /** 手动重听当前题目音频 */
  onReplayAudio() {
    this.playCurrentAudio();
  },

  onStart() {
    this.setData({ phase: 'testing', startTime: Date.now(), answers: [] }, () => {
      this.playCurrentAudio();
    });
  },

  onSelectAnswer(e: any) {
    const { index } = e.currentTarget.dataset;
    const question = this.data.questions[this.data.currentIndex];
    const q = question as any;
    const correct = index === q.correctIndex;
    const timeSpent = Date.now() - (this.data.startTime || Date.now());

    const answers = [...this.data.answers, { correct, timeSpent }];
    this.setData({
      answers,
      correctCount: this.data.correctCount + (correct ? 1 : 0),
    });

    // 下一题（简单模式，前6题后直接结果）
    if (this.data.currentIndex >= 5) {
      this.finishTest();
    } else {
      setTimeout(() => {
        this.setData({ currentIndex: this.data.currentIndex + 1 }, () => {
          this.playCurrentAudio();
        });
      }, 600);
    }
  },

  finishTest() {
    const total = this.data.questions.slice(0, 6).length; // 只计前6题客观题
    const correct = this.data.answers.filter((a: any) => a.correct).length;
    const score = Math.round((correct / Math.max(total, 1)) * 100);

    const result = {
      totalScore: score,
      soundAbility: score > 80 ? '良好' : score > 60 ? '一般' : '需加强',
      blendAbility: '待评估',
      segmentAbility: '待评估',
      readingAbility: '待评估',
      weakPhonemes: score < 80 ? ['ph_s','ph_a','ph_t','ph_p','ph_i'] : [],
      suggestion: score >= 80 ? '表现不错！可以继续下一单元学习。' : '建议复习 SATPI 单元的基础内容后再试。',
    };

    // 保存到本地
    const records = storage.get<any[]>('assessment_records') || [];
    records.push({ date: new Date().toISOString(), result });
    storage.set('assessment_records', records);
    // 标记已完成评估 -> 首页「开始能力评估」提示窗口不再显示
    storage.set('assessment_completed', true);

    eventBus.emit('assessment_completed', { result });

    this.setData({ phase: 'result', result, score });
  },

  onRetry() {
    this.generateQuestions();
    this.setData({ phase: 'testing', currentIndex: 0, answers: [], correctCount: 0, startTime: Date.now() });
  },

  onBack() {
    wx.navigateBack();
  },
});
