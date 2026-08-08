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
        currentStation: 0,
        totalStations: 5,
        currentWord: '',
        letterTiles: [],
        trainCars: [],
        score: 0,
        correctCount: 0,
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
                currentStation: 0,
                score: 0,
                correctCount: 0,
                wrongCount: 0,
                combo: 0,
                maxCombo: 0,
                gameOver: false,
                startTime: Date.now(),
            });
            this.nextStation();
        },
        nextStation() {
            const { currentStation, totalStations } = this.data;
            if (currentStation >= totalStations) {
                this.endGame();
                return;
            }
            const stations = this.properties.gameData;
            const station = stations[currentStation];
            if (!station) {
                this.endGame();
                return;
            }
            this.setData({
                currentStation: currentStation + 1,
                currentWord: station.word,
                letterTiles: station.letters,
                trainCars: [],
                feedbackVisible: false,
            });
        },
        onAddToTrain(e) {
            const { gameOver } = this.data;
            if (gameOver)
                return;
            const index = e.currentTarget.dataset.index;
            const letter = this.data.letterTiles[index];
            if (!letter)
                return;
            const letterTiles = [...this.data.letterTiles];
            letterTiles[index] = '';
            const trainCars = [
                ...this.data.trainCars,
                { letter, sourceIndex: index },
            ];
            this.setData({ letterTiles, trainCars });
        },
        onRemoveFromTrain(e) {
            const { gameOver } = this.data;
            if (gameOver)
                return;
            const carIndex = e.currentTarget.dataset.index;
            const car = this.data.trainCars[carIndex];
            if (!car)
                return;
            const trainCars = [...this.data.trainCars];
            trainCars.splice(carIndex, 1);
            const letterTiles = [...this.data.letterTiles];
            letterTiles[car.sourceIndex] = car.letter;
            this.setData({ trainCars, letterTiles });
        },
        onSubmit() {
            const { gameOver, currentWord, trainCars } = this.data;
            if (gameOver || trainCars.length === 0)
                return;
            const built = trainCars.map(c => c.letter).join('');
            const isCorrect = built === currentWord;
            let { score, correctCount, wrongCount, combo, maxCombo } = this.data;
            if (isCorrect) {
                combo += 1;
                score += 30 + combo * 10;
                correctCount += 1;
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
                correctCount,
                wrongCount,
                combo,
                maxCombo,
                feedbackVisible: true,
                feedbackType: isCorrect ? 'correct' : 'wrong',
                feedbackWord: built,
            });
            setTimeout(() => {
                this.setData({ feedbackVisible: false });
                this.nextStation();
            }, 1200);
        },
        onReset() {
            const station = this.properties.gameData[this.data.currentStation - 1];
            if (!station)
                return;
            this.setData({
                letterTiles: [...station.letters],
                trainCars: [],
            });
        },
        onReplayAudio() {
            wx.showToast({ title: '音频资源待配置', icon: 'none' });
        },
        endGame() {
            const duration = Math.floor((Date.now() - this.data.startTime) / 1000);
            const result = {
                gameType: 'phonemeTrain',
                score: this.data.score,
                correctCount: this.data.correctCount,
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
//# sourceMappingURL=phoneme-train.js.map