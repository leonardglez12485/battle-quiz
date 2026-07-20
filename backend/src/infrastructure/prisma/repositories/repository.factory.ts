import { Prisma } from '@prisma/client';
import { UnitOfWorkRepositories } from 'src/domain/repositories/repositories';
import {
  CategoryRepository,
  DifficultyLevelRepository,
  QuestionTypeRepository,
} from './catalog.repositories';
import { QuestionRepository } from './question.repository';
import { UserRepository } from './user.repository';
import { AchievementRepository, UserAchievementRepository } from './achievement.repositories';
import { GameSessionRepository } from './game-session.repository';

/**
 * Construye el conjunto de repositorios ligados a un cliente Prisma dado
 * (PrismaService fuera de transacción, o Prisma.TransactionClient dentro de
 * una). Evita duplicar el cableado en cada punto que necesita repositorios.
 */
export function buildRepositories(db: Prisma.TransactionClient): UnitOfWorkRepositories {
  return {
    categories: new CategoryRepository(db),
    difficultyLevels: new DifficultyLevelRepository(db),
    questionTypes: new QuestionTypeRepository(db),
    questions: new QuestionRepository(db),
    users: new UserRepository(db),
    achievements: new AchievementRepository(db),
    userAchievements: new UserAchievementRepository(db),
    gameSessions: new GameSessionRepository(db),
  };
}
