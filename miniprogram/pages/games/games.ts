import { ROUTES } from '../../config/routes';
import {
  whackMoleRounds,
  wordFishingTargets,
  phonemeTrainStations,
} from '../../modules/games/game-data';
import type { GameResult } from '../../modules/games/types';
import { storage } from '../../services/storage';
import { eventBus } from '../../utils/event-bus';

interface GameCard {
  id: string;
  name: string;
  icon: string;
  desc: string;
  status: string;
}

Page({
  data: {
    games: [
      { id: 'whack', name: '听音打地鼠', icon: '🐹', desc: '听到声音点击对应地鼠', status: 'available' },
      { id: 'fishing', name: '单词钓鱼', icon: '🎣', desc: '听单词钓出正确的鱼', status: 'available' },
      { id: 'train', name: '拼读小火车', icon: '🚂', desc: '点击字母拼出单词', status: 'available' },
    ] as GameCard[],
    activeGame: '',
    gameData: null as unknown,
    loading: false,
    error: '',
    history: [] as GameResult[],
  },

  onLoad(): void {
    this.loadHistory();
  },

  onTabChange(e: WechatMiniprogram.CustomEvent): void {
    const { tab } = e.detail;
    const rm: Record<string, string> = {
      home: ROUTES.HOME,
      course: ROUTES.COURSE_MAP,
      practice: ROUTES.PRACTICE,
      growth: ROUTES.GROWTH,
      profile: ROUTES.PROFILE,
    };
    const route = rm[tab];
    if (route && route !== ROUTES.GAMES) wx.redirectTo({ url: route });
  },

  onSelectGame(e: WechatMiniprogram.TouchEvent): void {
    const id = e.currentTarget.dataset.id as string;
    if (!id) return;

    eventBus.emit('game_started', { gameType: id });
    let gameData: unknown;
    switch (id) {
      case 'whack':
        gameData = whackMoleRounds;
        break;
      case 'fishing':
        gameData = wordFishingTargets;
        break;
      case 'train':
        gameData = phonemeTrainStations;
        break;
    }
    this.setData({ activeGame: id, gameData });
  },

  onGameComplete(e: WechatMiniprogram.CustomEvent): void {
    const result = e.detail as GameResult;
    this.saveResult(result);
    eventBus.emit('game_completed', result);

    wx.showToast({
      title: `得分: ${result.score}`,
      icon: 'none',
      duration: 2000,
    });
  },

  saveResult(result: GameResult): void {
    const history = storage.get<GameResult[]>('game_history') || [];
    history.push(result);
    // Keep last 20
    if (history.length > 20) history.splice(0, history.length - 20);
    storage.set('game_history', history);
    this.setData({ history });
  },

  loadHistory(): void {
    const history = storage.get<GameResult[]>('game_history') || [];
    this.setData({ history });
  },

  onBackToList(): void {
    this.setData({ activeGame: '', gameData: null });
  },
});
