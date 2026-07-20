import { evaluateAchievements } from 'src/application/evaluation/achievement-evaluator';
import { Achievement } from 'src/domain/entities/achievement.entity';
import { User } from 'src/domain/entities/user.entity';
import { AchievementCriteriaType } from 'src/domain/enums';

const buildUser = (): User => User.register({ name: 'Ana', email: 'ana@test.com', passwordHash: 'hash' });

const achievement = (code: string, type: AchievementCriteriaType, target: number): Achievement =>
  Achievement.create({ code, name: code, description: code, criteriaType: type, targetValue: target });

describe('evaluateAchievements', () => {
  it('desbloquea el logro de primer acierto al registrar respuestas correctas', () => {
    const user = buildUser();
    user.completeGame({
      xpEarned: 30, coinsEarned: 5, questionsAnswered: 10, correctAnswers: 1,
      averageResponseTimeSec: 8, streakInGame: 1,
    });

    const unlocked = evaluateAchievements({
      user,
      allAchievements: [achievement('first_correct', AchievementCriteriaType.TotalCorrectAnswers, 1)],
      alreadyUnlockedIds: new Set(),
      lastGamePerfect: false,
    });

    expect(unlocked.map((a) => a.code)).toEqual(['first_correct']);
  });

  it('no re-desbloquea logros ya obtenidos', () => {
    const user = buildUser();
    user.completeGame({
      xpEarned: 30, coinsEarned: 5, questionsAnswered: 5, correctAnswers: 5,
      averageResponseTimeSec: 8, streakInGame: 5,
    });

    const a = achievement('first_correct', AchievementCriteriaType.TotalCorrectAnswers, 1);
    const unlocked = evaluateAchievements({
      user,
      allAchievements: [a],
      alreadyUnlockedIds: new Set([a.id]),
      lastGamePerfect: true,
    });

    expect(unlocked).toHaveLength(0);
  });

  it('desbloquea partida perfecta solo cuando la última partida fue 100%', () => {
    const user = buildUser();
    const perfect = achievement('perfect', AchievementCriteriaType.PerfectGamePercentage, 100);

    const notPerfect = evaluateAchievements({
      user, allAchievements: [perfect], alreadyUnlockedIds: new Set(), lastGamePerfect: false,
    });
    const isPerfect = evaluateAchievements({
      user, allAchievements: [perfect], alreadyUnlockedIds: new Set(), lastGamePerfect: true,
    });

    expect(notPerfect).toHaveLength(0);
    expect(isPerfect.map((a) => a.code)).toEqual(['perfect']);
  });

  it('desbloquea logros de nivel según el nivel alcanzado', () => {
    const user = buildUser();
    user.gainExperience(1000); // varios niveles

    const unlocked = evaluateAchievements({
      user,
      allAchievements: [
        achievement('level_2', AchievementCriteriaType.UserLevelReached, 2),
        achievement('level_50', AchievementCriteriaType.UserLevelReached, 50),
      ],
      alreadyUnlockedIds: new Set(),
      lastGamePerfect: false,
    });

    expect(unlocked.map((a) => a.code)).toEqual(['level_2']);
  });
});
