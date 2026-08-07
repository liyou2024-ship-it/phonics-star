/**
 * 课程状态管理
 */

import { Level, Unit, Lesson } from '../types';
import * as courseService from '../services/course';

interface CourseState {
  levels: Level[];
  units: Unit[];
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
}

let state: CourseState = {
  levels: [],
  units: [],
  lessons: [],
  loading: false,
  error: null,
};

const listeners: Set<() => void> = new Set();

function notify(): void {
  listeners.forEach(fn => fn());
}

export const courseStore = {
  getState(): Readonly<CourseState> {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** 加载课程数据 */
  load(): void {
    try {
      state = { ...state, loading: true, error: null };
      notify();

      state = {
        levels: courseService.getLevels(),
        units: courseService.getUnits(),
        lessons: courseService.getLessons(),
        loading: false,
        error: null,
      };
    } catch (err) {
      state = {
        ...state,
        loading: false,
        error: (err as Error).message || '加载课程数据失败',
      };
    }
    notify();
  },

  /** 获取阶段下的单元 */
  getUnitsByLevelId(levelId: string): Unit[] {
    return state.units.filter(u => u.levelId === levelId);
  },

  /** 获取单元下的课节 */
  getLessonsByUnitId(unitId: string): Lesson[] {
    return state.lessons.filter(l => l.unitId === unitId);
  },
};
