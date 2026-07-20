import { GameMode, GameSessionStatus } from 'src/domain/enums';

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  country: string | null;
  registeredAt: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  coins: number;
  currentDailyStreak: number;
  statistics: {
    questionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracyPercentage: number;
    averageResponseTimeSec: number;
    longestStreak: number;
    favoriteCategoryId: string | null;
    bestPerformingCategoryId: string | null;
    worstPerformingCategoryId: string | null;
  };
}

export interface RankingEntry {
  position: number;
  name: string;
  level: number;
  xp: number;
  avatarUrl: string | null;
  isMe: boolean;
}

export interface HistoryEntry {
  id: string;
  mode: GameMode;
  status: GameSessionStatus;
  startedAt: string;
  durationSeconds: number;
  xpEarned: number;
  pointsEarned: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface AchievementEntry {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
}
