/**
 * 用户状态管理
 */

import { UserProfile, StudentProfile } from '../types';
import { getStoredUser } from '../services/auth.service';

interface UserState {
  profile: UserProfile;
  students: StudentProfile[];
}

const mockUser: UserProfile = {
  id: 'u_mock_001',
  nickname: '小明',
  avatarUrl: '/assets/images/default-avatar.png',
  role: 'student',
  activeStudentId: 's_mock_001',
};

const mockStudents: StudentProfile[] = [
  {
    id: 's_mock_001',
    name: '小明',
    age: 7,
    grade: '一年级',
    createdAt: '2025-09-01',
    active: true,
  },
];

// 启动时优先用已登录（本地持久化）的用户资料，避免首屏闪现 mock 用户
const initialProfile: UserProfile = getStoredUser() ?? mockUser;

let state: UserState = {
  profile: initialProfile,
  students: mockStudents,
};

const listeners: Set<() => void> = new Set();

function notify(): void {
  listeners.forEach(fn => fn());
}

export const userStore = {
  getState(): Readonly<UserState> {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** 设置当前登录用户资料（登录 / 自动注册后调用） */
  setProfile(profile: UserProfile): void {
    state = { ...state, profile };
    notify();
  },

  /** 获取当前活跃学生 */
  getActiveStudent(): StudentProfile | undefined {
    return state.students.find(s => s.id === state.profile.activeStudentId);
  },

  /** 切换活跃学生 */
  switchStudent(studentId: string): void {
    state = {
      ...state,
      profile: { ...state.profile, activeStudentId: studentId },
    };
    notify();
  },
};
