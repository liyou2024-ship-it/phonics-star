/**
 * 用户相关类型定义
 */

/** 用户角色 */
export type UserRole = 'student' | 'parent';

/** 用户资料 */
export interface UserProfile {
  /** 用户 ID */
  id: string;
  /** 昵称 */
  nickname: string;
  /** 头像 URL */
  avatarUrl: string;
  /** 角色 */
  role: UserRole;
  /** 当前学生档案 ID（家长可切换孩子） */
  activeStudentId: string | null;
}

/** 学生档案 */
export interface StudentProfile {
  /** 学生 ID */
  id: string;
  /** 姓名 */
  name: string;
  /** 年龄 */
  age: number;
  /** 年级 */
  grade: string;
  /** 创建时间 */
  createdAt: string;
  /** 是否活跃 */
  active: boolean;
}

/** 家长设置 */
export interface ParentSettings {
  /** 每日学习时长上限(分钟) */
  dailyTimeLimit: number;
  /** 是否需要学习提醒 */
  studyReminder: boolean;
  /** 提醒时间 HH:mm */
  reminderTime: string;
  /** 是否开启音效 */
  soundEnabled: boolean;
}
