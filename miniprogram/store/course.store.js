"use strict";
/**
 * 课程状态管理
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseStore = void 0;
const courseService = __importStar(require("../services/course"));
let state = {
    levels: [],
    units: [],
    lessons: [],
    loading: false,
    error: null,
};
const listeners = new Set();
function notify() {
    listeners.forEach(fn => fn());
}
exports.courseStore = {
    getState() {
        return state;
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    /** 加载课程数据 */
    load() {
        try {
            state = { ...state, loading: true, error: null };
            notify();
            state = {
                levels: courseService.getLevels(),
                units: courseService.getUnits(),
                lessons: courseService.getLessons(),
                loading: false,
                error: null,
            };
        }
        catch (err) {
            state = {
                ...state,
                loading: false,
                error: err.message || '加载课程数据失败',
            };
        }
        notify();
    },
    /** 获取阶段下的单元 */
    getUnitsByLevelId(levelId) {
        return state.units.filter(u => u.levelId === levelId);
    },
    /** 获取单元下的课节 */
    getLessonsByUnitId(unitId) {
        return state.lessons.filter(l => l.unitId === unitId);
    },
};
//# sourceMappingURL=course.store.js.map