/** 验证课程 ID 格式 */
export function isValidLessonId(id: string): boolean {
  return /^L\d{3}$/.test(id);
}

/** 验证单元 ID 格式 */
export function isValidUnitId(id: string): boolean {
  return /^unit_[a-z_]+$/.test(id);
}

/** 验证星级 0-3 */
export function isValidStars(stars: number): boolean {
  return stars >= 0 && stars <= 3;
}

/** 验证得分 0-100 */
export function isValidScore(score: number): boolean {
  return score >= 0 && score <= 100;
}
