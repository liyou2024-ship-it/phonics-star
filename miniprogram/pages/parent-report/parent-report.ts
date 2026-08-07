import {
  getStudyDuration,
  getActiveDays,
  getAccuracy,
  getWeakPhonemes,
  getEventsByDate,
  getEventsByType,
} from '../../services/analytics';
import { getProgress } from '../../services/progress';
import { getPhonemeById } from '../../services/course';
import { rewardStore } from '../../modules/rewards/reward.store';
import { getTodayDate } from '../../utils/format';

/* ---------- types ---------- */

type TimeRange = 'today' | '7days' | '30days';

interface WeakPhonemeItem {
  phonemeId: string;
  displayName: string;
  symbol: string;
  listenErrors: number;
  blendErrors: number;
  segmentErrors: number;
  pronunciationWeak: number;
  weakScore: number;
  isMock: boolean;
}

interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  text: string;
}

interface CompletedCourse {
  lessonId: string;
  name: string;
  score: number;
  stars: number;
  completedAt: string;
}

/* ---------- helpers ---------- */

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDatesInRange(range: TimeRange): string[] {
  const dates: string[] = [];
  const today = new Date();
  let days = 1;
  if (range === '7days') days = 7;
  if (range === '30days') days = 30;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(formatDateStr(d));
  }
  return dates;
}

/** 按会话类型给 duration 封顶 */
function capSessionDuration(events: Array<{ eventType: string; duration: number; sessionId: string }>): number {
  const groups: Record<string, { type: string; total: number }> = {};

  for (const e of events) {
    let t = 'other';
    if (e.eventType.startsWith('lesson_')) t = 'course';
    else if (e.eventType.startsWith('practice_')) t = 'practice';
    else if (e.eventType.startsWith('game_')) t = 'game';

    const key = `${e.sessionId}_${t}`;
    if (!groups[key]) groups[key] = { type: t, total: 0 };
    groups[key].total += e.duration;
  }

  const caps: Record<string, number> = { course: 30 * 60, practice: 20 * 60, game: 15 * 60 };
  let total = 0;
  for (const g of Object.values(groups)) {
    total += Math.min(g.total, caps[g.type] || g.total);
  }
  return Math.round(total / 60); // seconds → minutes
}

/** 读取 prompt 中 questionType 之类的字段 */
function getQuestionType(payload: Record<string, unknown>): string {
  return (payload.questionType as string) || (payload.type as string) || '';
}

function isMockPayload(payload: Record<string, unknown>): boolean {
  return payload.source === 'mock' || payload.evaluator === 'mock';
}

/* ---------- Page ---------- */

Page({
  data: {
    /* 时间范围 */
    timeRange: '7days' as TimeRange,
    timeRanges: [
      { key: 'today', label: '今日' },
      { key: '7days', label: '最近7天' },
      { key: '30days', label: '最近30天' },
    ] as Array<{ key: TimeRange; label: string }>,

    /* 概览 */
    studyDuration: 0,
    activeDays: 0,
    completedCourses: 0,
    accuracy: 0,

    /* 详情 */
    practiceSessions: 0,
    gameSessions: 0,
    totalAnswers: 0,
    pronunciationCount: 0,

    /* 已掌握 */
    masteredPhonemes: 0,
    masteredWords: 0,

    /* 弱音素 Top 3 */
    weakPhonemes: [] as WeakPhonemeItem[],

    /* 连续学习 */
    streak: 0,

    /* 星星 & 能量 */
    stars: 0,
    energy: 0,

    /* 已完成课程列表 */
    completedCourseList: [] as CompletedCourse[],

    /* 建议 */
    suggestions: [] as Suggestion[],

    /* 状态 */
    loading: true,
    error: '',
    empty: false,

    /* 数据说明 */
    hasMockEvaluations: false,
  },

  onLoad() {
    this.loadReport(this.data.timeRange);
  },

  /* ---- 时间范围切换 ---- */
  onTimeRangeTap(e: any) {
    const range = e.currentTarget.dataset.range as TimeRange;
    this.setData({ timeRange: range });
    this.loadReport(range);
  },

  onRetry() {
    this.loadReport(this.data.timeRange);
  },

  /* ---- 核心加载 ---- */
  loadReport(range: TimeRange) {
    this.setData({ loading: true, error: '', empty: false });

    try {
      const dates = getDatesInRange(range);
      const allEvents = dates.flatMap(d => getEventsByDate(d));

      if (allEvents.length === 0) {
        this.setData({ loading: false, empty: true });
        return;
      }

      const progress = getProgress();
      const rewards = rewardStore.getState();

      // 1. 真实学习时长（按 session 类型封顶）
      const studyDuration = capSessionDuration(allEvents);

      // 2. 活跃天数 — 只计有实际活动事件的日期（排除纯 page_view）
      const activeDaysSet = new Set<string>();
      for (const e of allEvents) {
        if (e.eventType !== 'page_view' && e.eventType !== 'app_show') {
          activeDaysSet.add(e.timestamp.slice(0, 10));
        }
      }
      const activeDays = activeDaysSet.size;

      // 3. 完成课程数
      const completedCourses = Object.values(progress.lessonProgressMap).filter(
        lp => lp.status === 'completed',
      ).length;

      // 4. 练习局数
      const practiceSessions = dates.reduce(
        (sum, d) =>
          sum +
          getEventsByDate(d).filter(e => e.eventType === 'practice_completed').length,
        0,
      );

      // 5. 游戏完成次数
      const gameSessions = dates.reduce(
        (sum, d) =>
          sum + getEventsByDate(d).filter(e => e.eventType === 'game_completed').length,
        0,
      );

      // 6. 总答题数
      const totalAnswers = allEvents.filter(
        e => e.eventType === 'answer_correct' || e.eventType === 'answer_incorrect',
      ).length;

      // 7. 正确率（仅当前日期范围）
      const rangeCorrect = allEvents.filter(e => e.eventType === 'answer_correct').length;
      const rangeIncorrect = allEvents.filter(e => e.eventType === 'answer_incorrect').length;
      const accuracy =
        rangeCorrect + rangeIncorrect > 0
          ? Math.round((rangeCorrect / (rangeCorrect + rangeIncorrect)) * 100)
          : 0;

      // 8. 跟读次数
      const pronunciationCount = allEvents.filter(
        e => e.eventType === 'pronunciation_evaluated',
      ).length;

      // 9. 已掌握音素
      const masteredPhonemes = progress.masteredPhonemeIds.length;

      // 10. 已掌握单词数
      const masteredWords = progress.masteredWordIds.length;

      // 11. 连续学习天数
      const streak = progress.streak;

      // 12. 星星和能量
      const stars = rewards.totalStars;
      const energy = rewards.energy;

      // 13. 弱音素（加权评分，Top 3）
      const weakPhonemes = computeWeakPhonemes(dates);
      const topWeakPhonemes = weakPhonemes.slice(0, 3);

      // 14. 规则化学习建议
      const suggestions = buildSuggestions(weakPhonemes, accuracy, streak, allEvents.length > 0);

      // 15. 是否有 Mock 评测
      const hasMockEvaluations = allEvents.some(
        e => e.eventType === 'pronunciation_evaluated' && isMockPayload(e.payload),
      );

      // 16. 本周课程完成列表
      const completedCourseList = buildCompletedCourseList(progress, dates);

      this.setData({
        studyDuration,
        activeDays,
        completedCourses,
        accuracy,
        practiceSessions,
        gameSessions,
        totalAnswers,
        pronunciationCount,
        masteredPhonemes,
        masteredWords,
        streak,
        stars,
        energy,
        weakPhonemes: topWeakPhonemes,
        suggestions,
        hasMockEvaluations,
        completedCourseList,
        loading: false,
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: (err as Error).message || '加载失败，请重试',
      });
    }
  },
});

/* ========== 弱音素加权计算 ========== */

function computeWeakPhonemes(dates: string[]): WeakPhonemeItem[] {
  // 收集所有回答错误事件
  const errorEvents = dates.flatMap(d =>
    getEventsByDate(d).filter(e => e.eventType === 'answer_incorrect'),
  );

  // 收集跟读弱项（pronunciation_evaluated 中 score < 70）
  const pronunciationEvents = dates.flatMap(d =>
    getEventsByDate(d).filter(
      e =>
        e.eventType === 'pronunciation_evaluated' &&
        (e.payload.overallScore as number) < 70,
    ),
  );

  const map: Record<
    string,
    {
      phonemeId: string;
      listenErrors: number;
      blendErrors: number;
      segmentErrors: number;
      pronunciationWeak: number;
      isMock: boolean;
    }
  > = {};

  function ensure(id: string) {
    if (!map[id]) {
      map[id] = {
        phonemeId: id,
        listenErrors: 0,
        blendErrors: 0,
        segmentErrors: 0,
        pronunciationWeak: 0,
        isMock: false,
      };
    }
    return map[id];
  }

  for (const e of errorEvents) {
    const pid = (e.payload.phonemeId as string) || e.relatedId || '';
    if (!pid) continue;
    const entry = ensure(pid);
    const qt = getQuestionType(e.payload);

    if (qt.includes('listen') || qt.includes('听音')) {
      entry.listenErrors += 1;
    } else if (qt.includes('blend') || qt.includes('拼读')) {
      entry.blendErrors += 1;
    } else if (qt.includes('segment') || qt.includes('拆音')) {
      entry.segmentErrors += 1;
    }
    // 兜底：无明确类型时计入 listenErrors
    else {
      entry.listenErrors += 1;
    }

    if (isMockPayload(e.payload)) entry.isMock = true;
  }

  for (const e of pronunciationEvents) {
    const pid = (e.payload.phonemeId as string) || e.relatedId || '';
    if (!pid) continue;
    const entry = ensure(pid);
    entry.pronunciationWeak += 1;
    if (isMockPayload(e.payload)) entry.isMock = true;
  }

  const list: WeakPhonemeItem[] = Object.values(map)
    .map(v => {
      const weakScore =
        v.listenErrors * 2 + v.blendErrors * 2 + v.segmentErrors * 2 + v.pronunciationWeak;
      const phoneme = getPhonemeById(v.phonemeId);
      return {
        ...v,
        displayName: phoneme?.displayName || v.phonemeId,
        symbol: phoneme?.symbol || '',
        weakScore,
      };
    })
    .sort((a, b) => b.weakScore - a.weakScore);

  return list;
}

/* ========== 规则化学习建议 ========== */

function buildSuggestions(
  weakPhonemes: WeakPhonemeItem[],
  accuracy: number,
  streak: number,
  hasData: boolean,
): Suggestion[] {
  const list: Suggestion[] = [];

  if (!hasData) {
    list.push({ priority: 'low', text: '完成一节课程后即可生成个性化建议' });
    return list;
  }

  // 规则 1：音素 listenErrors > 3
  const listenWeak = weakPhonemes.find(p => p.listenErrors > 3);
  if (listenWeak) {
    list.push({
      priority: 'high',
      text: `建议对「${listenWeak.displayName}」音素进行短期重复练习，每次借助示例单词多听多辨，帮助巩固听音辨音能力`,
    });
  }

  // 规则 2：拼读正确率 < 70%
  if (accuracy < 70) {
    list.push({
      priority: 'medium',
      text: '每天安排 3-5 分钟拼读练习，从 CVC 单词开始缓慢拆分-拼合，逐步提升拼读流畅度',
    });
  }

  // 规则 3：连续学习天数 > 5
  if (streak > 5) {
    list.push({
      priority: 'low',
      text: '你已经连续学习超过 5 天，坚持的力量很棒！继续保持每天的学习节奏',
    });
  }

  // 默认建议
  if (list.length === 0) {
    list.push({ priority: 'low', text: '保持每天学习 1-2 节课的节奏，扎实打好自然拼读基础' });
  }

  return list;
}

/* ========== 本周课程完成列表 ========== */

function buildCompletedCourseList(progress: ReturnType<typeof getProgress>, dates: string[]): CompletedCourse[] {
  const result: CompletedCourse[] = [];
  for (const lp of Object.values(progress.lessonProgressMap)) {
    if (lp.status !== 'completed' || !lp.completedAt) continue;
    const d = lp.completedAt.slice(0, 10);
    if (!dates.includes(d)) continue;
    result.push({
      lessonId: lp.lessonId,
      name: lp.lessonId, // 课节名称直接用 ID，后续可从 course service 获取
      score: lp.score,
      stars: lp.stars,
      completedAt: lp.completedAt,
    });
  }
  result.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return result;
}
