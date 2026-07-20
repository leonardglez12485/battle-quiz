import { Achievement } from 'src/domain/entities/achievement.entity';
import { User } from 'src/domain/entities/user.entity';
import { AchievementCriteriaType } from 'src/domain/enums';

/**
 * Evalúa qué logros se cumplen para un usuario dado su estado actual y el
 * resultado de la última partida. Es una función pura: recibe todo lo que
 * necesita y no toca persistencia — el caso de uso decide qué insertar.
 * Agregar un criterio nuevo = un case más aquí + el enum (Domain no cambia
 * su estructura; los logros concretos siguen viviendo en la base).
 */
export function evaluateAchievements(params: {
  user: User;
  allAchievements: Achievement[];
  alreadyUnlockedIds: Set<string>;
  lastGamePerfect: boolean;
}): Achievement[] {
  const { user, allAchievements, alreadyUnlockedIds, lastGamePerfect } = params;
  const unlocked: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (alreadyUnlockedIds.has(achievement.id)) continue;

    const met = (() => {
      switch (achievement.criteriaType) {
        case AchievementCriteriaType.TotalCorrectAnswers:
          return user.statistics.correctAnswers >= achievement.targetValue;
        case AchievementCriteriaType.UserLevelReached:
          return user.level >= achievement.targetValue;
        case AchievementCriteriaType.DailyStreakDays:
          return user.currentDailyStreak >= achievement.targetValue;
        case AchievementCriteriaType.PerfectGamePercentage:
          return lastGamePerfect;
        default:
          return false;
      }
    })();

    if (met) unlocked.push(achievement);
  }

  return unlocked;
}
