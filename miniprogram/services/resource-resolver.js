"use strict";
/**
 * 资源解析服务
 * 统一处理图片、音频等资源的回退逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImage = resolveImage;
exports.resolveAudio = resolveAudio;
exports.getResourceStatus = getResourceStatus;
exports.getMissingResourcesForPack = getMissingResourcesForPack;
exports.getAllMissingResources = getAllMissingResources;
exports.isPackReady = isPackReady;
exports.getMissingResources = getMissingResources;
const EMOJI_MAP = {
    cat: '🐱', bat: '🦇', hat: '🎩', mat: '🧘', rat: '🐀',
    sat: '💺', fat: '😺', man: '👨', can: '🥫', fan: '🌀',
    pan: '🍳', van: '🚐', map: '🗺️', cap: '🧢', nap: '😴',
    tap: '🔨', big: '🐘', pig: '🐷', dig: '⛏️', wig: '👩‍🦰',
    pin: '📌', win: '🏆', fin: '🦈', bin: '🗑️', sit: '🪑',
    hit: '👊', fit: '💪', bit: '📐', kit: '🧰', hop: '🐇',
    top: '🔝', mop: '🧹', pop: '💥', dog: '🐕', log: '🪵',
    fog: '🌫️', jog: '🏃', sun: '☀️', run: '🏃‍♂️', fun: '🎉',
    bun: '🍞', cut: '✂️', hut: '🛖', nut: '🥜', but: '🦋',
    bed: '🛏️', red: '🔴', pen: '🖊️', hen: '🐔', net: '🥅',
    cup: '🥤', bug: '🐛', rug: '🧶', fox: '🦊', box: '📦',
    six: '6️⃣', jam: '🍯', ham: '🍖', bus: '🚌', ant: '🐜',
    sock: '🧦', duck: '🦆', ship: '🚢', fish: '🐟',
    sap: '🌳', sip: '🥤', pit: '🕳️', tip: '💡', pat: '👋',
};
// ---- Internal helpers ----
let cachedManifest = null;
let cachedPackWords = null;
function getManifest() {
    if (cachedManifest)
        return cachedManifest;
    try {
        cachedManifest = require('../data/resource-manifest.json');
        return cachedManifest;
    }
    catch {
        return { version: '0', resources: [] };
    }
}
/** 从 SATPI 课程包加载单词数据（缓存） */
function getSatpiWords() {
    if (cachedPackWords)
        return cachedPackWords;
    try {
        cachedPackWords = require('../data/course-packs/starter-satpi/words.json');
        return cachedPackWords;
    }
    catch {
        cachedPackWords = {};
        return cachedPackWords;
    }
}
/** 加载指定课程包的元数据 */
function loadPackMeta(packId) {
    try {
        return require(`../data/course-packs/${packId}/pack.json`);
    }
    catch {
        return null;
    }
}
/** 从课程包加载所有关联资源 ID */
function loadPackRelatedIds(packId) {
    const ids = [];
    try {
        // 加载 pack.json 获取基础信息
        const packMeta = loadPackMeta(packId);
        // 加载课程包中的 phonemes 和 words 数据
        const phonemes = require(`../data/course-packs/${packId}/phonemes.json`);
        const words = require(`../data/course-packs/${packId}/words.json`);
        // 收集 phoneme IDs
        for (const key of Object.keys(phonemes)) {
            ids.push(key);
        }
        // 收集 word IDs
        for (const key of Object.keys(words)) {
            ids.push(key);
        }
    }
    catch {
        // 如果课程包数据加载失败，返回空数组
    }
    return ids;
}
// ---- Public API ----
/**
 * 解析图片资源
 * @param wordId 单词 ID（如 w_sat），用于从课程包查找配图路径
 * @param imageUrl 直接传入的图片 URL，优先级高于课程包查找
 * @returns 可用的图片 URL 或 emoji 回退
 */
function resolveImage(wordId, imageUrl) {
    // 优先级 1: 直接传入的 imageUrl
    if (imageUrl && imageUrl.trim() !== '')
        return imageUrl;
    // 优先级 2: 通过 wordId 从 SATPI 课程包查找
    if (wordId) {
        const packWords = getSatpiWords();
        const wordData = packWords[wordId];
        if (wordData && wordData.imageUrl && wordData.imageUrl.trim() !== '') {
            return wordData.imageUrl;
        }
        // 回退: 用 wordData.text 查找 emoji
        if (wordData && wordData.text) {
            const emoji = EMOJI_MAP[wordData.text.toLowerCase()];
            if (emoji)
                return emoji;
        }
    }
    // 优先级 3: 直接以 wordId 为文本查找 emoji（兼容旧调用方式）
    const emoji = EMOJI_MAP[wordId.toLowerCase()];
    if (emoji)
        return emoji;
    return '';
}
/**
 * 解析音频资源
 * @param audioUrl 音频 URL
 * @param resourceType 资源类型（可选），用于未来扩展
 * @returns 音频可用性信息
 */
function resolveAudio(audioUrl, resourceType) {
    if (audioUrl && audioUrl.trim() !== '') {
        return { url: audioUrl, available: true, message: '' };
    }
    return { url: '', available: false, message: '音频资源待配置' };
}
/**
 * 获取单个资源的状态
 * @param resourceId 资源 ID
 * @returns 资源状态
 */
function getResourceStatus(resourceId) {
    const manifest = getManifest();
    const resource = manifest.resources.find(r => r.resourceId === resourceId);
    return resource ? resource.status : 'missing';
}
/**
 * 获取指定课程包中所有缺失的资源
 * @param packId 课程包 ID（如 starter-satpi）
 * @returns 缺失的资源条目列表
 */
function getMissingResourcesForPack(packId) {
    const manifest = getManifest();
    const relatedIds = loadPackRelatedIds(packId);
    const relatedIdSet = new Set(relatedIds);
    return manifest.resources.filter(r => r.status === 'missing' && relatedIdSet.has(r.relatedId));
}
/**
 * 获取所有缺失的资源
 * @returns 所有状态为 missing 的资源条目列表
 */
function getAllMissingResources() {
    const manifest = getManifest();
    return manifest.resources.filter(r => r.status === 'missing');
}
/**
 * 检查课程包的所有资源是否已就绪
 * @param packId 课程包 ID
 * @returns 如果课程包所有必要资源都就绪则返回 true
 */
function isPackReady(packId) {
    const missing = getMissingResourcesForPack(packId);
    return missing.length === 0;
}
let cachedLegacyManifest = null;
/**
 * @deprecated 请使用 getAllMissingResources()
 */
function getMissingResources() {
    if (cachedLegacyManifest)
        return cachedLegacyManifest;
    try {
        const manifest = require('../data/resource-manifest.json');
        cachedLegacyManifest = manifest.resources
            .filter(r => r.status === 'missing')
            .map(r => ({
            type: r.type,
            path: r.expectedPath,
            related: r.relatedWordId || r.relatedPhonemeId || '',
        }));
        return cachedLegacyManifest;
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=resource-resolver.js.map