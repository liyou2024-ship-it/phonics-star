"use strict";
/**
 * 录音模块
 * 封装 wx.getRecorderManager()，提供统一录音接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecorder = getRecorder;
class WxRecorder {
    constructor() {
        this.status = 'idle';
        this.resolveFn = null;
        this.rejectFn = null;
        this.manager = wx.getRecorderManager();
        this.bindEvents();
    }
    bindEvents() {
        // 录音开始
        this.manager.onStart(() => {
            this.status = 'recording';
            console.log('[Recorder] 录音开始');
        });
        // 录音停止（返回临时文件）
        this.manager.onStop((res) => {
            this.status = 'stopped';
            const result = {
                tempFilePath: res.tempFilePath,
                duration: res.duration,
                fileSize: res.fileSize,
            };
            console.log('[Recorder] 录音停止', result);
            this.resolveFn?.(result);
        });
        // 录音错误
        this.manager.onError((res) => {
            this.status = 'error';
            const error = new Error(res.errMsg || '录音失败');
            console.error('[Recorder] 录音错误', error);
            this.rejectFn?.(error);
        });
    }
    /**
     * 请求录音权限
     */
    async requestPermission() {
        this.status = 'requesting';
        try {
            const setting = await wx.getSetting();
            if (setting.authSetting['scope.record'] === false) {
                // 用户已拒绝，需要引导打开设置
                const res = await wx.openSetting();
                return res.authSetting['scope.record'] === true;
            }
            // 未授权，请求授权
            const authRes = await wx.authorize({ scope: 'scope.record' });
            return true;
        }
        catch (err) {
            // 用户拒绝授权
            console.warn('[Recorder] 用户拒绝录音权限');
            this.status = 'idle';
            return false;
        }
    }
    /**
     * 开始录音
     */
    async start() {
        return new Promise((resolve, reject) => {
            if (this.status === 'recording') {
                reject(new Error('已在录音中'));
                return;
            }
            this.manager.start({
                duration: 30000, // 最长30秒
                sampleRate: 16000, // 采样率 16kHz
                numberOfChannels: 1, // 单声道
                encodeBitRate: 48000, // 编码码率
                format: 'mp3', // mp3 格式
                frameSize: 50, // 帧大小
            });
            // 延迟 resolve，等待 onStart 事件触发
            setTimeout(() => resolve(), 300);
        });
    }
    /**
     * 停止录音并返回录音结果
     */
    async stop() {
        return new Promise((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
            this.manager.stop();
        });
    }
    /**
     * 释放资源
     */
    dispose() {
        this.manager.stop();
        this.status = 'idle';
        this.resolveFn = null;
        this.rejectFn = null;
    }
}
/** 单例 */
let recorderInstance = null;
function getRecorder() {
    if (!recorderInstance) {
        recorderInstance = new WxRecorder();
    }
    return recorderInstance;
}
//# sourceMappingURL=recorder.js.map