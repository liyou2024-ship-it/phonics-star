"use strict";
/**
 * 奖励状态管理
 * 轻量级 store，使用全局变量 + 事件通知
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardStore = void 0;
const defaultPet = {
    petId: 'pet_seedling',
    name: '小苗',
    emoji: '🌱',
    level: 1,
    experience: 0,
    experienceToNextLevel: 50,
    unlockedLessonsCount: 0,
};
let state = {
    badges: [],
    totalStars: 0,
    energy: 100,
    pet: defaultPet,
};
/** 监听器列表 */
const listeners = new Set();
function notify() {
    listeners.forEach(fn => fn());
}
exports.rewardStore = {
    getState() {
        return state;
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    /** 添加星星 */
    addStars(count) {
        state = { ...state, totalStars: state.totalStars + count };
        notify();
    },
    /** 添加能量 */
    addEnergy(count) {
        state = { ...state, energy: Math.min(state.energy + count, 999) };
        notify();
    },
    /** 完成课节获得奖励 */
    applyReward(reward) {
        switch (reward.type) {
            case 'stars':
                state = { ...state, totalStars: state.totalStars + reward.amount };
                break;
            case 'energy':
                state = { ...state, energy: Math.min(state.energy + reward.amount, 999) };
                break;
            case 'badge':
                if (reward.targetId) {
                    const exists = state.badges.some(b => b.badgeId === reward.targetId);
                    if (!exists) {
                        state = {
                            ...state,
                            badges: [...state.badges, { badgeId: reward.targetId, earnedAt: new Date().toISOString() }],
                        };
                    }
                }
                break;
            case 'pet_food':
                state = {
                    ...state,
                    pet: {
                        ...state.pet,
                        experience: state.pet.experience + reward.amount,
                    },
                };
                // 检查升级
                if (state.pet.experience >= state.pet.experienceToNextLevel) {
                    state = {
                        ...state,
                        pet: {
                            ...state.pet,
                            level: state.pet.level + 1,
                            experience: state.pet.experience - state.pet.experienceToNextLevel,
                            experienceToNextLevel: Math.floor(state.pet.experienceToNextLevel * 1.5),
                        },
                    };
                }
                break;
        }
        notify();
    },
    /** 重置（测试用） */
    reset() {
        state = { badges: [], totalStars: 0, energy: 100, pet: defaultPet };
        notify();
    },
};
//# sourceMappingURL=reward.store.js.map