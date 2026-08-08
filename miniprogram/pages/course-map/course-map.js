"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const course_store_1 = require("../../store/course.store");
const progress_store_1 = require("../../store/progress.store");
const routes_1 = require("../../config/routes");
Page({
    data: {
        levels: [],
        loading: true,
        error: '',
    },
    onLoad() {
        this.loadData();
    },
    onShow() {
        progress_store_1.progressStore.reload();
        this.updateLevelStates();
    },
    loadData() {
        try {
            course_store_1.courseStore.load();
            const levels = course_store_1.courseStore.getState().levels;
            const progress = progress_store_1.progressStore.getState();
            const levelData = levels.map((level) => {
                const units = course_store_1.courseStore.getUnitsByLevelId(level.id);
                const allLessonIds = units.flatMap(u => u.lessonIds);
                const completedCount = allLessonIds.filter(id => progress_store_1.progressStore.isLessonCompleted(id)).length;
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
                            const lesson = course_store_1.courseStore.getState().lessons.find(l => l.id === lid);
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
        }
        catch (err) {
            this.setData({ loading: false, error: err.message });
        }
    },
    updateLevelStates() {
        this.loadData();
    },
    onLessonTap(e) {
        const { lessonId } = e.currentTarget.dataset;
        wx.navigateTo({ url: `${routes_1.ROUTES.LESSON}?lessonId=${lessonId}` });
    },
    onTabChange(e) {
        const { tab } = e.detail;
        const routeMap = {
            home: routes_1.ROUTES.HOME,
            course: routes_1.ROUTES.COURSE_MAP,
            practice: routes_1.ROUTES.PRACTICE,
            growth: routes_1.ROUTES.GROWTH,
            profile: routes_1.ROUTES.PROFILE,
        };
        const route = routeMap[tab];
        if (route && route !== routes_1.ROUTES.COURSE_MAP) {
            wx.redirectTo({ url: route });
        }
    },
});
//# sourceMappingURL=course-map.js.map