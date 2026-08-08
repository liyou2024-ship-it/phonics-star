"use strict";
/**
 * 奖励服务
 * 管理徽章检查、奖励发放逻辑
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBadges = getAllBadges;
exports.getBadgeById = getBadgeById;
exports.checkBadgeCondition = checkBadgeCondition;
exports.calculateEnergyReward = calculateEnergyReward;
const badges_json_1 = __importDefault(require("../../data/badges.json"));
/**
 * 获取所有可用徽章
 */
function getAllBadges() {
    return badges_json_1.default;
}
/**
 * 根据 ID 获取徽章
 */
function getBadgeById(id) {
    return badges_json_1.default.find(b => b.id === id);
}
/**
 * 检查徽章条件是否满足（Mock 实现，后续接入真实逻辑）
 */
function checkBadgeCondition(badge, context) {
    // 简单的条件检查：context 中对应 key 达到 1 即可
    return (context[badge.id] ?? 0) >= 1;
}
/**
 * 计算完成任务后的能量奖励
 */
function calculateEnergyReward(baseEnergy, streakMultiplier) {
    return Math.floor(baseEnergy * (1 + streakMultiplier * 0.1));
}
//# sourceMappingURL=reward.service.js.map