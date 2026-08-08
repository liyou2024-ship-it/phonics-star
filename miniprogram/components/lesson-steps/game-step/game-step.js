"use strict";
/**
 * 小游戏步骤组件
 * 简易打地鼠：3 张卡片，点中正确的得分，共 5 轮
 */
Component({
    properties: {
        step: { type: Object, value: {} },
        lesson: { type: Object, value: {} },
        state: { type: Object, value: { status: 'not_started' } },
    },
    data: {
        gameType: 'whack-a-mole',
        gameResult: null,
        playing: false,
        completed: false,
        /** 当前轮的 3 张卡片 */
        moles: [],
        currentRound: 0,
        totalRounds: 5,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
    },
    lifetimes: {
        attached() {
            const gameType = this.properties.step?.content?.gameType || 'whack-a-mole';
            this.setData({ gameType });
        },
    },
    methods: {
        /** 开始游戏 */
        onStartGame() {
            this.setData({
                playing: true,
                completed: false,
                currentRound: 0,
                score: 0,
                correctCount: 0,
                wrongCount: 0,
                gameResult: null,
            });
            this.nextRound();
        },
        /** 进入下一轮 */
        nextRound() {
            const { currentRound, totalRounds } = this.data;
            if (currentRound >= totalRounds) {
                this.finishGame();
                return;
            }
            // 生成 3 张卡片，随机选一个为目标
            const words = this.getWordPool();
            const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 3);
            const targetIndex = Math.floor(Math.random() * 3);
            const moles = shuffled.map((word, i) => ({
                id: i,
                word,
                isTarget: i === targetIndex,
                active: false,
                hit: false,
            }));
            this.setData({ moles, currentRound: currentRound + 1 });
            // 短暂显示目标后开始
            setTimeout(() => {
                const activated = this.data.moles.map(m => ({
                    ...m,
                    active: true,
                }));
                this.setData({ moles: activated });
            }, 500);
        },
        /** 获取候选词池 */
        getWordPool() {
            const { lesson } = this.properties;
            if (lesson?.targetWordIds?.length) {
                return lesson.targetWordIds.slice(0, 6);
            }
            return ['cat', 'sat', 'mat', 'hat', 'bat', 'pat'];
        },
        /** 点击卡片 */
        onHitMole(e) {
            const { id } = e.currentTarget.dataset;
            const mole = this.data.moles.find(m => m.id === id);
            if (!mole || mole.hit)
                return;
            const updated = this.data.moles.map(m => m.id === id ? { ...m, hit: true } : m);
            this.setData({ moles: updated });
            if (mole.isTarget) {
                this.setData({
                    score: this.data.score + 20,
                    correctCount: this.data.correctCount + 1,
                });
                wx.showToast({ title: '✅ 正确！+20', icon: 'success', duration: 800 });
                setTimeout(() => this.nextRound(), 1000);
            }
            else {
                this.setData({
                    score: Math.max(0, this.data.score - 5),
                    wrongCount: this.data.wrongCount + 1,
                });
                wx.showToast({ title: '❌ 再试试', icon: 'none', duration: 800 });
                // 允许继续点击直到找到正确的
            }
        },
        /** 结束游戏 */
        finishGame() {
            const { score, correctCount, wrongCount } = this.data;
            const passed = correctCount >= 3;
            this.setData({
                playing: false,
                completed: true,
                gameResult: { score, correct: correctCount, wrong: wrongCount },
            });
            this.triggerEvent('complete', {
                passed,
                score,
                attempts: wrongCount + correctCount,
                duration: 0,
                data: {
                    gameType: this.data.gameType,
                    correctCount,
                    wrongCount,
                    rounds: this.data.totalRounds,
                },
            });
        },
        /** 再来一局 */
        onPlayAgain() {
            this.onStartGame();
        },
    },
});
//# sourceMappingURL=game-step.js.map