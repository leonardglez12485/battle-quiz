import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IAchievementRepository,
  IGameSessionRepository,
  IUserAchievementRepository,
  IUserRepository,
} from 'src/domain/repositories/repositories';
import {
  ACHIEVEMENT_REPOSITORY,
  GAME_SESSION_REPOSITORY,
  USER_ACHIEVEMENT_REPOSITORY,
  USER_REPOSITORY,
} from 'src/domain/repositories/repository.tokens';
import { AchievementEntry, HistoryEntry, ProfileResponse, RankingEntry } from './users.dto';

/** Lecturas del perfil del jugador: perfil+estadísticas, ranking, historial y logros. */
@Injectable()
export class UsersService {
  /** Debe coincidir con User.XP_PER_LEVEL_FACTOR (regla de progresión). */
  private static readonly XpPerLevelFactor = 100;

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(GAME_SESSION_REPOSITORY) private readonly gameSessions: IGameSessionRepository,
    @Inject(ACHIEVEMENT_REPOSITORY) private readonly achievements: IAchievementRepository,
    @Inject(USER_ACHIEVEMENT_REPOSITORY) private readonly userAchievements: IUserAchievementRepository,
  ) {}

  async profile(userId: string): Promise<ProfileResponse> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException('El usuario no existe.');

    const s = user.statistics;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      country: user.country,
      registeredAt: user.registeredAt.toISOString(),
      level: user.level,
      xp: user.xp,
      xpForNextLevel: user.level * UsersService.XpPerLevelFactor,
      coins: user.coins,
      currentDailyStreak: user.currentDailyStreak,
      statistics: {
        questionsAnswered: s.questionsAnswered,
        correctAnswers: s.correctAnswers,
        incorrectAnswers: s.incorrectAnswers,
        accuracyPercentage: s.accuracyPercentage,
        averageResponseTimeSec: s.averageResponseTimeSec,
        longestStreak: s.longestStreak,
        favoriteCategoryId: s.favoriteCategoryId,
        bestPerformingCategoryId: s.bestPerformingCategoryId,
        worstPerformingCategoryId: s.worstPerformingCategoryId,
      },
    };
  }

  async ranking(currentUserId: string, count = 50): Promise<RankingEntry[]> {
    const top = await this.users.topByXp(count);
    return top.map((u, i) => ({
      position: i + 1,
      name: u.name,
      level: u.level,
      xp: u.xp,
      avatarUrl: u.avatarUrl,
      isMe: u.id === currentUserId,
    }));
  }

  async history(userId: string, page = 1, pageSize = 20): Promise<HistoryEntry[]> {
    const sessions = await this.gameSessions.historyByUser(userId, page, pageSize);
    return sessions.map((g) => ({
      id: g.id,
      mode: g.mode,
      status: g.status,
      startedAt: g.startedAt.toISOString(),
      durationSeconds: g.durationSeconds,
      xpEarned: g.xpEarned,
      pointsEarned: g.pointsEarned,
      questionsAnswered: g.questions.length,
      correctAnswers: g.questions.filter((q) => q.isCorrect).length,
    }));
  }

  async achievementsFor(userId: string): Promise<AchievementEntry[]> {
    const [all, mine] = await Promise.all([
      this.achievements.findAll(),
      this.userAchievements.findByUserId(userId),
    ]);
    const unlockedById = new Map(mine.map((m) => [m.achievementId, m.unlockedAt]));

    return all.map((a) => {
      const unlockedAt = unlockedById.get(a.id);
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description,
        iconUrl: a.iconUrl,
        unlocked: unlockedAt !== undefined,
        unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
      };
    });
  }
}
