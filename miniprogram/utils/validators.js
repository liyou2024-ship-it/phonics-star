"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidLessonId = isValidLessonId;
exports.isValidUnitId = isValidUnitId;
exports.isValidStars = isValidStars;
exports.isValidScore = isValidScore;
/** 验证课程 ID 格式 */
function isValidLessonId(id) {
    return /^L\d{3}$/.test(id);
}
/** 验证单元 ID 格式 */
function isValidUnitId(id) {
    return /^unit_[a-z_]+$/.test(id);
}
/** 验证星级 0-3 */
function isValidStars(stars) {
    return stars >= 0 && stars <= 3;
}
/** 验证得分 0-100 */
function isValidScore(score) {
    return score >= 0 && score <= 100;
}
//# sourceMappingURL=validators.js.map