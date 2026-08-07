/**
 * 页面路由配置
 */

export const ROUTES = {
  HOME: '/pages/home/home',
  COURSE_MAP: '/pages/course-map/course-map',
  LESSON: '/pages/lesson/lesson',
  PRACTICE: '/pages/practice/practice',
  GAMES: '/pages/games/games',
  GROWTH: '/pages/growth/growth',
  ASSESSMENT: '/pages/assessment/assessment',
  PARENT_REPORT: '/pages/parent-report/parent-report',
  PROFILE: '/pages/profile/profile',
  SETTINGS: '/pages/settings/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
