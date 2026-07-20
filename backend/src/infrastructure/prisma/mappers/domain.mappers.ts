import {
  Category as PrismaCategory,
  DifficultyLevel as PrismaDifficulty,
  QuestionType as PrismaQuestionType,
  Question as PrismaQuestion,
  Answer as PrismaAnswer,
  User as PrismaUser,
  UserStatistics as PrismaUserStatistics,
  Achievement as PrismaAchievement,
  UserAchievement as PrismaUserAchievement,
  GameSession as PrismaGameSession,
  GameSessionQuestion as PrismaGameSessionQuestion,
} from '@prisma/client';

import { Category } from 'src/domain/entities/category.entity';
import { DifficultyLevel } from 'src/domain/entities/difficulty-level.entity';
import { QuestionType } from 'src/domain/entities/question-type.entity';
import { Question } from 'src/domain/entities/question.entity';
import { Answer } from 'src/domain/entities/answer.entity';
import { User } from 'src/domain/entities/user.entity';
import { UserStatistics } from 'src/domain/entities/user-statistics.entity';
import { Achievement, UserAchievement } from 'src/domain/entities/achievement.entity';
import { GameSession, GameSessionQuestion } from 'src/domain/entities/game-session.entity';
import {
  QuestionStatus,
  GameMode,
  GameSessionStatus,
  AchievementCriteriaType,
} from 'src/domain/enums';

/**
 * Mappers persistencia <-> dominio. Los enums de Prisma tienen los mismos
 * valores string que los enums de dominio, por eso el cast es directo. Este
 * es el único lugar que conoce ambos mundos; el dominio nunca importa tipos
 * de @prisma/client.
 */
export class DomainMappers {
  static toCategory(row: PrismaCategory): Category {
    return Category.fromPersistence({
      id: row.id,
      name: row.name,
      description: row.description,
      iconUrl: row.iconUrl,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toDifficulty(row: PrismaDifficulty): DifficultyLevel {
    return DifficultyLevel.fromPersistence({
      id: row.id,
      name: row.name,
      score: row.score,
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toQuestionType(row: PrismaQuestionType): QuestionType {
    return QuestionType.fromPersistence({
      id: row.id,
      code: row.code,
      name: row.name,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toAnswer(row: PrismaAnswer): Answer {
    return Answer.fromPersistence({
      id: row.id,
      questionId: row.questionId,
      text: row.text,
      isCorrect: row.isCorrect,
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toQuestion(row: PrismaQuestion & { answers: PrismaAnswer[] }): Question {
    return Question.fromPersistence({
      id: row.id,
      categoryId: row.categoryId,
      difficultyLevelId: row.difficultyLevelId,
      questionTypeId: row.questionTypeId,
      text: row.text,
      educationalExplanation: row.educationalExplanation,
      status: row.status as QuestionStatus,
      answers: (row.answers ?? []).map((a) => DomainMappers.toAnswer(a)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toUserStatistics(row: PrismaUserStatistics): UserStatistics {
    return UserStatistics.fromPersistence({
      id: row.id,
      userId: row.userId,
      questionsAnswered: row.questionsAnswered,
      correctAnswers: row.correctAnswers,
      incorrectAnswers: row.incorrectAnswers,
      averageResponseTimeSec: row.averageResponseTimeSec,
      longestStreak: row.longestStreak,
      favoriteCategoryId: row.favoriteCategoryId,
      bestPerformingCategoryId: row.bestPerformingCategoryId,
      worstPerformingCategoryId: row.worstPerformingCategoryId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toUser(row: PrismaUser & { statistics: PrismaUserStatistics | null }): User {
    const statistics = row.statistics
      ? DomainMappers.toUserStatistics(row.statistics)
      : UserStatistics.createEmpty(row.id);

    return User.fromPersistence({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      avatarUrl: row.avatarUrl,
      country: row.country,
      registeredAt: row.registeredAt,
      level: row.level,
      xp: row.xp,
      coins: row.coins,
      currentDailyStreak: row.currentDailyStreak,
      lastPlayedDate: row.lastPlayedDate ? row.lastPlayedDate.toISOString().slice(0, 10) : null,
      statistics,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toAchievement(row: PrismaAchievement): Achievement {
    return Achievement.fromPersistence({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      iconUrl: row.iconUrl,
      criteriaType: row.criteriaType as AchievementCriteriaType,
      targetValue: row.targetValue,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toUserAchievement(row: PrismaUserAchievement): UserAchievement {
    return UserAchievement.fromPersistence({
      id: row.id,
      userId: row.userId,
      achievementId: row.achievementId,
      unlockedAt: row.unlockedAt,
      createdAt: row.createdAt,
    });
  }

  static toGameSessionQuestion(row: PrismaGameSessionQuestion): GameSessionQuestion {
    return new GameSessionQuestion({
      gameSessionId: row.gameSessionId,
      questionId: row.questionId,
      selectedAnswerId: row.selectedAnswerId,
      writtenAnswer: row.writtenAnswer,
      isCorrect: row.isCorrect,
      timeTakenSeconds: row.timeTakenSeconds,
      pointsAwarded: row.pointsAwarded,
      order: row.order,
      id: row.id,
      createdAt: row.createdAt,
    });
  }

  static toGameSession(row: PrismaGameSession & { questions: PrismaGameSessionQuestion[] }): GameSession {
    return GameSession.fromPersistence({
      id: row.id,
      userId: row.userId,
      mode: row.mode as GameMode,
      status: row.status as GameSessionStatus,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      durationSeconds: row.durationSeconds,
      xpEarned: row.xpEarned,
      pointsEarned: row.pointsEarned,
      questions: (row.questions ?? []).map((q) => DomainMappers.toGameSessionQuestion(q)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
