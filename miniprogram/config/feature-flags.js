"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURES = void 0;
exports.FEATURES = {
    // 语音评测使用 Mock（正式服务未接入）
    USE_MOCK_SPEECH_EVALUATOR: true,
    // 开发环境显示缺失资源警告
    SHOW_MISSING_RESOURCE_WARNING: true,
    // 资源缺失时允许 Emoji/文字回退
    ENABLE_RESOURCE_DEV_FALLBACK: true,
    // 家长报告
    ENABLE_PARENT_REPORT: true,
    // 单元测试
    ENABLE_UNIT_ASSESSMENT: true,
    // 课程包发布前强制校验
    ENABLE_COURSE_PACK_VALIDATION: true,
    // 游戏中心
    GAME_CENTER: true,
    // 复习系统
    REVIEW_SYSTEM: true,
    // 好友助力
    FRIEND_CHALLENGE: false,
    // 排行榜
    LEADERBOARD: false,
    // 会员系统
    MEMBERSHIP: false,
    // 多孩账号
    MULTI_CHILD: false,
};
//# sourceMappingURL=feature-flags.js.map