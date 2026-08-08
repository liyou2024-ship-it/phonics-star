"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Component({
    properties: {
        familyName: {
            type: String,
            value: '',
        },
        gameData: {
            type: Array,
            value: [],
        },
    },
    data: {
        currentRound: 0,
        totalRounds: 5,
        currentTarget: '',
        fishes: [],
        score: 0,
        caughtCount: 0,
        wrongCount: 0,
        maxCombo: 0,
        combo: 0,
        gameOver: false,
        feedbackVisible: false,
        feedbackType: '',
        feedbackWord: '',
        startTime: 0,
    },
    methods: {
        startGame() {
            this.setData({
                currentRound: 0,
                score: 0,
                caughtCount: 0,
                wrongCount: 0,
                combo: 0,
                maxCombo: 0,
                gameOver: false,
                startTime: Date.now(),
            });
            this.nextRound();
        },
        nextRound() {
            const { currentRound, totalRounds } = this.data;
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            const targets = this.properties.gameData;
            const target = targets[currentRound];
            if (!target) {
                this.endGame();
                return;
            }
            const fishes = target.fishes
                .sort(() => Math.random() - 0.5)
                .map((word) => ({ word, caught: false }));
            this.setData({
                currentRound: currentRound + 1,
                currentTarget: target.word,
                fishes,
                feedbackVisible: false,
            });
        },
        onCatchFish(e) {
            const { gameOver } = this.data;
            if (gameOver)
                return;
            const index = e.currentTarget.dataset.index;
            const fish = this.data.fishes[index];
            if (!fish || fish.caught)
                return;
            fish.caught = true;
            const isCorrect = fish.word === this.data.currentTarget;
            let { score, caughtCount, wrongCount, combo, maxCombo } = this.data;
            if (isCorrect) {
                combo += 1;
                score += 20 + combo * 5;
                caughtCount += 1;
                if (combo > maxCombo)
                    maxCombo = combo;
            }
            else {
                combo = 0;
                wrongCount += 1;
                score = Math.max(0, score - 10);
            }
            this.setData({
                score,
                caughtCount,
                wrongCount,
                combo,
                maxCombo,
                fishes: [...this.data.fishes],
                feedbackVisible: true,
                feedbackType: isCorrect ? 'correct' : 'wrong',
                feedbackWord: fish.word,
            });
            if (isCorrect) {
                setTimeout(() => {
                    this.setData({ feedbackVisible: false });
                    this.nextRound();
                }, 1000);
            }
        },
        onReplayAudio() {
            wx.showToast({ title: '音频资源待配置', icon: 'none' });
        },
        endGame() {
            const duration = Math.floor((Date.now() - this.data.startTime) / 1000);
            const result = {
                gameType: 'wordFishing',
                score: this.data.score,
                correctCount: this.data.caughtCount,
                wrongCount: this.data.wrongCount,
                maxCombo: this.data.maxCombo,
                duration,
                completed: true,
                completedAt: new Date().toISOString(),
            };
            this.setData({ gameOver: true });
            this.triggerEvent('complete', result);
        },
        onRestart() {
            this.startGame();
        },
    },
    lifetimes: {
        attached() {
            this.startGame();
        },
    },
});
//# sourceMappingURL=word-fishing.js.map