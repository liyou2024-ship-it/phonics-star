"use strict";
/**
 * 课程数据服务
 * 从 JSON 数据文件加载课程内容（数据驱动）
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevels = getLevels;
exports.getLevelById = getLevelById;
exports.getUnits = getUnits;
exports.getUnitsByLevelId = getUnitsByLevelId;
exports.getLessons = getLessons;
exports.getLessonsByUnitId = getLessonsByUnitId;
exports.getLessonById = getLessonById;
exports.getPhonemes = getPhonemes;
exports.getPhonemeById = getPhonemeById;
exports.getWords = getWords;
exports.getWordById = getWordById;
exports.getWordsByFamilyId = getWordsByFamilyId;
exports.getWordFamilies = getWordFamilies;
exports.getWordFamilyById = getWordFamilyById;
exports.getDecodableReaders = getDecodableReaders;
exports.getReaderById = getReaderById;
const levels_json_1 = __importDefault(require("../data/levels.json"));
const units_json_1 = __importDefault(require("../data/units.json"));
const lessons_json_1 = __importDefault(require("../data/lessons.json"));
const phonemes_json_1 = __importDefault(require("../data/phonemes.json"));
const words_json_1 = __importDefault(require("../data/words.json"));
const word_families_json_1 = __importDefault(require("../data/word-families.json"));
const decodable_readers_json_1 = __importDefault(require("../data/decodable-readers.json"));
/** 获取所有阶段 */
function getLevels() {
    return levels_json_1.default;
}
/** 获取阶段 */
function getLevelById(id) {
    return levels_json_1.default.find(l => l.id === id);
}
/** 获取所有单元 */
function getUnits() {
    return units_json_1.default;
}
/** 获取阶段下的单元 */
function getUnitsByLevelId(levelId) {
    return units_json_1.default.filter(u => u.levelId === levelId);
}
/** 获取所有课节 */
function getLessons() {
    return lessons_json_1.default;
}
/** 获取单元下的课节 */
function getLessonsByUnitId(unitId) {
    return lessons_json_1.default.filter(l => l.unitId === unitId);
}
/** 获取课节 */
function getLessonById(id) {
    return lessons_json_1.default.find(l => l.id === id);
}
/** 获取所有音素 */
function getPhonemes() {
    return phonemes_json_1.default;
}
/** 获取音素 */
function getPhonemeById(id) {
    return phonemes_json_1.default.find(p => p.id === id);
}
/** 获取所有单词 */
function getWords() {
    return words_json_1.default;
}
/** 获取单词 */
function getWordById(id) {
    return words_json_1.default.find(w => w.id === id);
}
/** 获取词族下的单词 */
function getWordsByFamilyId(familyId) {
    return words_json_1.default.filter(w => w.familyId === familyId);
}
/** 获取所有词族 */
function getWordFamilies() {
    return word_families_json_1.default;
}
/** 获取词族 */
function getWordFamilyById(id) {
    return word_families_json_1.default.find(f => f.id === id);
}
/** 获取所有可解码读物 */
function getDecodableReaders() {
    return decodable_readers_json_1.default;
}
/** 获取读物 */
function getReaderById(id) {
    return decodable_readers_json_1.default.find(r => r.id === id);
}
//# sourceMappingURL=course.js.map