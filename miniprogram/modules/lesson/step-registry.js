"use strict";
/**
 * 步骤注册表
 * 根据 step.type 映射到对应组件路径
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStepComponent = getStepComponent;
exports.getRegisteredTypes = getRegisteredTypes;
/** 步骤类型 → 组件路径映射 */
const registry = [
    { type: 'phoneme_intro', component: '/components/lesson-steps/phoneme-intro/phoneme-intro' },
    { type: 'sound_discrimination', component: '/components/lesson-steps/audio-choice/audio-choice' },
    { type: 'audio_choice', component: '/components/lesson-steps/audio-choice/audio-choice' },
    { type: 'phoneme_blending', component: '/components/lesson-steps/blend-builder/blend-builder' },
    { type: 'blend_word', component: '/components/lesson-steps/blend-builder/blend-builder' },
    { type: 'word_segmenting', component: '/components/lesson-steps/sound-segmenter/sound-segmenter' },
    { type: 'segment_word', component: '/components/lesson-steps/sound-segmenter/sound-segmenter' },
    { type: 'pronunciation', component: '/components/lesson-steps/pronunciation-practice/pronunciation-practice' },
    { type: 'mini_game', component: '/components/lesson-steps/game-step/game-step' },
    { type: 'decodable_reading', component: '/components/lesson-steps/decodable-reader/decodable-reader' },
    { type: 'lesson_reward', component: '/components/lesson-steps/lesson-reward/lesson-reward' },
    // 课程包（SATPI）的"测试结果"步骤：暂复用奖励组件展示成绩/奖励，避免 unknown step type
    { type: 'assessment_result', component: '/components/lesson-steps/lesson-reward/lesson-reward' },
];
/** 根据步骤类型获取组件路径 */
function getStepComponent(type) {
    const entry = registry.find(r => r.type === type);
    return entry?.component || null;
}
/** 获取所有注册的步骤类型 */
function getRegisteredTypes() {
    return registry.map(r => r.type);
}
//# sourceMappingURL=step-registry.js.map