"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Component({
    properties: {
        gameData: {
            type: Array,
            value: [],
        },
    },
    data: {
        currentRound: 0,
        totalRounds: 10,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        combo: 0,
        maxCombo: 0,
        moles: [],
        roundResult: '',
        gameOver: false,
        roundActive: false,
        feedbackVisible: false,
        feedbackType: '',
        feedbackLetter: '',
        startTime: 0,
    },
    methods: {
        startGame() {
            const data = this.data;
            this.setData({
                currentRound: 0,
                score: 0,
                correctCount: 0,
                wrongCount: 0,
                combo: 0,
                maxCombo: 0,
                gameOver: false,
                roundActive: false,
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
            const rounds = this.properties.gameData;
            const round = rounds[currentRound];
            if (!round) {
                this.endGame();
                return;
            }
            const correctLetter = round.target;
            const others = round.options.filter((l) => l !== correctLetter);
            const shuffled = [...others].sort(() => Math.random() - 0.5);
            const picks = [correctLetter, shuffled[0], shuffled[1]].sort(() => Math.random() - 0.5);
            const moles = picks.map(letter => ({
                letter,
                isTarget: letter === correctLetter,
                show: true,
                hit: false,
            }));
            this.setData({
                currentRound: currentRound + 1,
                moles,
                roundResult: '',
                roundActive: true,
                feedbackVisible: false,
                feedbackType: '',
                feedbackLetter: '',
            });
        },
        onHitMole(e) {
            const { roundActive, gameOver } = this.data;
            if (!roundActive || gameOver)
                return;
            const index = e.currentTarget.dataset.index;
            const mole = this.data.moles[index];
            if (!mole || mole.hit)
                return;
            mole.hit = true;
            const isCorrect = mole.isTarget;
            let { score, correctCount, wrongCount, combo, maxCombo } = this.data;
            if (isCorrect) {
                combo += 1;
                score += 10 + combo * 2;
                correctCount += 1;
                if (combo > maxCombo)
                    maxCombo = combo;
            }
            else {
                combo = 0;
                wrongCount += 1;
                score = Math.max(0, score - 5);
            }
            this.setData({
                score,
                correctCount,
                wrongCount,
                combo,
                maxCombo,
                roundActive: false,
                roundResult: isCorrect ? 'correct' : 'wrong',
                moles: [...this.data.moles],
                feedbackVisible: true,
                feedbackType: isCorrect ? 'correct' : 'wrong',
                feedbackLetter: mole.letter,
            });
            setTimeout(() => {
                this.setData({ feedbackVisible: false });
                this.nextRound();
            }, 800);
        },
        onReplayAudio() {
            wx.showToast({ title: '音频资源待配置', icon: 'none' });
        },
        endGame() {
            const duration = Math.floor((Date.now() - this.data.startTime) / 1000);
            const result = {
                gameType: 'whackMole',
                score: this.data.score,
                correctCount: this.data.correctCount,
                wrongCount: this.data.wrongCount,
                maxCombo: this.data.maxCombo,
                duration,
                completed: true,
                completedAt: new Date().toISOString(),
            };
            this.setData({ gameOver: true, roundActive: false });
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
//# sourceMappingURL=whack-mole.js.map