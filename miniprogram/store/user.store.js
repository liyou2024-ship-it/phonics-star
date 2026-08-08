"use strict";
/**
 * 用户状态管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userStore = void 0;
const auth_service_1 = require("../services/auth.service");
const mockUser = {
    id: 'u_mock_001',
    nickname: '小明',
    avatarUrl: '/assets/images/default-avatar.png',
    role: 'student',
    activeStudentId: 's_mock_001',
};
const mockStudents = [
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
const initialProfile = (0, auth_service_1.getStoredUser)() ?? mockUser;
let state = {
    profile: initialProfile,
    students: mockStudents,
};
const listeners = new Set();
function notify() {
    listeners.forEach(fn => fn());
}
exports.userStore = {
    getState() {
        return state;
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    /** 设置当前登录用户资料（登录 / 自动注册后调用） */
    setProfile(profile) {
        state = { ...state, profile };
        notify();
    },
    /** 获取当前活跃学生 */
    getActiveStudent() {
        return state.students.find(s => s.id === state.profile.activeStudentId);
    },
    /** 切换活跃学生 */
    switchStudent(studentId) {
        state = {
            ...state,
            profile: { ...state.profile, activeStudentId: studentId },
        };
        notify();
    },
};
//# sourceMappingURL=user.store.js.map