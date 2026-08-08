"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../config/routes");
const game_data_1 = require("../../modules/games/game-data");
const storage_1 = require("../../services/storage");
const event_bus_1 = require("../../utils/event-bus");
Page({
    data: {
        games: [
            { id: 'whack', name: '听音打地鼠', icon: '🐹', desc: '听到声音点击对应地鼠', status: 'available' },
            { id: 'fishing', name: '单词钓鱼', icon: '🎣', desc: '听单词钓出正确的鱼', status: 'available' },
            { id: 'train', name: '拼读小火车', icon: '🚂', desc: '点击字母拼出单词', status: 'available' },
        ],
        activeGame: '',
        gameData: null,
        loading: false,
        error: '',
        history: [],
    },
    onLoad() {
        this.loadHistory();
    },
    onTabChange(e) {
        const { tab } = e.detail;
        const rm = {
            home: routes_1.ROUTES.HOME,
            course: routes_1.ROUTES.COURSE_MAP,
            practice: routes_1.ROUTES.PRACTICE,
            growth: routes_1.ROUTES.GROWTH,
            profile: routes_1.ROUTES.PROFILE,
        };
        const route = rm[tab];
        if (route && route !== routes_1.ROUTES.GAMES)
            wx.redirectTo({ url: route });
    },
    onSelectGame(e) {
        const id = e.currentTarget.dataset.id;
        if (!id)
            return;
        event_bus_1.eventBus.emit('game_started', { gameType: id });
        let gameData;
        switch (id) {
            case 'whack':
                gameData = game_data_1.whackMoleRounds;
                break;
            case 'fishing':
                gameData = game_data_1.wordFishingTargets;
                break;
            case 'train':
                gameData = game_data_1.phonemeTrainStations;
                break;
        }
        this.setData({ activeGame: id, gameData });
    },
    onGameComplete(e) {
        const result = e.detail;
        this.saveResult(result);
        event_bus_1.eventBus.emit('game_completed', result);
        wx.showToast({
            title: `得分: ${result.score}`,
            icon: 'none',
            duration: 2000,
        });
    },
    saveResult(result) {
        const history = storage_1.storage.get('game_history') || [];
        history.push(result);
        // Keep last 20
        if (history.length > 20)
            history.splice(0, history.length - 20);
        storage_1.storage.set('game_history', history);
        this.setData({ history });
    },
    loadHistory() {
        const history = storage_1.storage.get('game_history') || [];
        this.setData({ history });
    },
    onBackToList() {
        this.setData({ activeGame: '', gameData: null });
    },
});
//# sourceMappingURL=games.js.map