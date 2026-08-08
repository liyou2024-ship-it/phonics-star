"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInt = randomInt;
exports.randomPick = randomPick;
exports.shuffle = shuffle;
/** 生成 [min, max] 的随机整数 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** 从数组中随机取一个元素 */
function randomPick(arr) {
    return arr[randomInt(0, arr.length - 1)];
}
/** 打乱数组 */
function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
//# sourceMappingURL=random.js.map