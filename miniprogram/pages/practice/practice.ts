import { PracticeMode, PracticeQuestion } from '../../modules/practice/types';
import { practiceEngine } from '../../modules/practice/practice-engine';
import { saveSession } from '../../modules/practice/practice-session';
import { ROUTES } from '../../config/routes';

const MODES: { key: PracticeMode; icon: string; label: string }[] = [
  { key: 'listen', icon: '\u{1F442}', label: '听音辨字母' },
  { key: 'spell', icon: '\u{270D}\u{FE0F}', label: '听音拼单词' },
  { key: 'family', icon: '\u{1F4D6}', label: '词族训练' },
  { key: 'error_review', icon: '\u{1F527}', label: '错音复习' },
];

interface PageData {
  modes: typeof MODES;
  activeMode: PracticeMode;
  phase: 'select' | 'question' | 'result' | 'empty';
  loading: boolean;
  error: string;
  currentQuestion: PracticeQuestion | null;
  answered: boolean;
  selectedAnswerIndex: number;
  isCorrect: boolean | null;
  explanation: string;
  feedbackClass: string;
  progress: string;
  results: { total: number; correct: number; score: number };
}

Page({
  data: {
    modes: MODES,
    activeMode: 'listen',
    phase: 'select',
    loading: false,
    error: '',
    currentQuestion: null as any,
    answered: false,
    selectedAnswerIndex: -1,
    isCorrect: null as any,
    explanation: '',
    feedbackClass: '',
    progress: '',
    results: { total: 0, correct: 0, score: 0 },
  },

  /** 切换模式 tab */
  onModeTap(e: WechatMiniprogram.CustomEvent) {
    const { key } = e.currentTarget.dataset as { key: PracticeMode };
    const phase: PageData['phase'] = key === 'error_review' ? 'select' : 'select';
    this.setData({ activeMode: key, phase, error: '', answered: false });
  },

  /** 开始练习 */
  onStartPractice() {
    const { activeMode } = this.data;
    this.setData({ loading: true, error: '' });

    try {
      const session = practiceEngine.startSession(activeMode as any);

      if (!session.questions || session.questions.length === 0) {
        if (activeMode === 'error_review') {
          this.setData({ phase: 'empty', loading: false });
          return;
        }
        this.setData({ error: '暂无题目', loading: false });
        return;
      }

      saveSession(session);

      const q = practiceEngine.getCurrentQuestion();
      this.setData({
        phase: 'question',
        loading: false,
        currentQuestion: q,
        answered: false,
        isCorrect: null as any,
        explanation: '',
        feedbackClass: '',
        progress: `1/${session.questions.length}`,
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: (err as Error).message || '开始练习失败',
      });
    }
  },

  /** 选择答案 */
  onOptionTap(e: WechatMiniprogram.CustomEvent) {
    if (this.data.answered) return;

    const { index } = e.currentTarget.dataset as { index: number };
    const { correct, explanation } = practiceEngine.answerQuestion(index);

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
    const hasNext = practiceEngine.nextQuestion();

    if (!hasNext) {
      const session = practiceEngine.getSession();
      const results = practiceEngine.getResults();
      this.setData({
        phase: 'result',
        results,
      });
      return;
    }

    const session = practiceEngine.getSession();
    saveSession(session!);

    const q = practiceEngine.getCurrentQuestion();
    this.setData({
      currentQuestion: q,
      answered: false,
      selectedAnswerIndex: -1,
      isCorrect: null as any,
      explanation: '',
      feedbackClass: '',
      progress: session ? `${session.currentIndex + 1}/${session.questions.length}` : '',
    });
  },

  /** 再练一次 */
  onRetry() {
    practiceEngine.reset();
    this.setData({ phase: 'select', error: '' });
  },

  /** 错题重做 */
  onErrorReview() {
    practiceEngine.reset();
    this.setData({ activeMode: 'error_review', phase: 'select', error: '' });
  },

  /** 去做练习（空状态） */
  onGoPractice() {
    practiceEngine.reset();
    this.setData({ activeMode: 'listen', phase: 'select', error: '' });
  },

  /** 播放音频 */
  onPlayAudio() {
    const { currentQuestion } = this.data;
    if (!(currentQuestion as any)?.audioUrl) {
      wx.showToast({ title: '音频资源待配置', icon: 'none' });
      return;
    }

    const audio = wx.createInnerAudioContext();
    audio.src = (currentQuestion as any).audioUrl;
    audio.play();
    audio.onError(() => {
      wx.showToast({ title: '音频资源待配置', icon: 'none' });
    });
  },

  /** loading 重试 */
  onRetryLoad() {
    this.onStartPractice();
  },

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { tab } = e.detail;
    const routeMap: Record<string, string> = {
      home: ROUTES.HOME,
      course: ROUTES.COURSE_MAP,
      practice: ROUTES.PRACTICE,
      growth: ROUTES.GROWTH,
      profile: ROUTES.PROFILE,
    };
    const route = routeMap[tab];
    if (route && route !== ROUTES.PRACTICE) wx.redirectTo({ url: route });
  },
});
