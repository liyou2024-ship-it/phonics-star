import { courseStore } from '../../store/course.store';
import { progressStore } from '../../store/progress.store';
import { ROUTES } from '../../config/routes';

Page({
  data: {
    levels: [] as Array<Record<string, unknown>>,
    loading: true,
    error: '',
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    progressStore.reload();
    this.updateLevelStates();
  },

  loadData() {
    try {
      courseStore.load();
      const levels = courseStore.getState().levels;
      const progress = progressStore.getState();

      const levelData = levels.map((level) => {
        const units = courseStore.getUnitsByLevelId(level.id);
        const allLessonIds = units.flatMap(u => u.lessonIds);
        const completedCount = allLessonIds.filter(id =>
          progressStore.isLessonCompleted(id)
        ).length;
        const totalCount = allLessonIds.length;
        const progressPercent = totalCount > 0
          ? Math.round((completedCount / totalCount) * 100)
          : 0;

        return {
          id: level.id,
          name: level.name,
          icon: level.icon,
          description: level.description,
          locked: level.locked,
          unitCount: units.length,
          lessonCount: totalCount,
          completedCount,
          progressPercent,
          units: units.map(u => ({
            id: u.id,
            title: u.title,
            objectives: u.objectives,
            lessons: u.lessonIds.map(lid => {
              const lesson = courseStore.getState().lessons.find(l => l.id === lid);
              const lp = progress.lessonProgressMap[lid];
              return {
                id: lid,
                title: lesson?.title || '',
                completed: lp?.status === 'completed',
                stars: lp?.stars || 0,
                isCurrent: progress.currentLessonId === lid,
              };
            }),
          })),
        };
      });

      this.setData({ levels: levelData, loading: false });
    } catch (err) {
      this.setData({ loading: false, error: (err as Error).message });
    }
  },

  updateLevelStates() {
    this.loadData();
  },

  onLessonTap(e: WechatMiniprogram.BaseEvent) {
    const { lessonId } = e.currentTarget.dataset;
    wx.navigateTo({ url: `${ROUTES.LESSON}?lessonId=${lessonId}` });
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
    if (route && route !== ROUTES.COURSE_MAP) {
      wx.redirectTo({ url: route });
    }
  },
});
