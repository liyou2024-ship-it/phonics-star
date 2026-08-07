export interface GameResult {
  gameType: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  maxCombo: number;
  duration: number;
  completed: boolean;
  completedAt?: string;
}
