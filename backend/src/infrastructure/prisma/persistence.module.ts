import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUnitOfWork } from './unit-of-work';
import {
  CATEGORY_REPOSITORY,
  DIFFICULTY_LEVEL_REPOSITORY,
  QUESTION_TYPE_REPOSITORY,
  QUESTION_REPOSITORY,
  USER_REPOSITORY,
  ACHIEVEMENT_REPOSITORY,
  USER_ACHIEVEMENT_REPOSITORY,
  GAME_SESSION_REPOSITORY,
  UNIT_OF_WORK,
} from 'src/domain/repositories/repository.tokens';
import {
  CategoryRepository,
  DifficultyLevelRepository,
  QuestionTypeRepository,
} from './repositories/catalog.repositories';
import { QuestionRepository } from './repositories/question.repository';
import { UserRepository } from './repositories/user.repository';
import {
  AchievementRepository,
  UserAchievementRepository,
} from './repositories/achievement.repositories';
import { GameSessionRepository } from './repositories/game-session.repository';

/**
 * Único punto que enlaza los contratos de repositorio (tokens del dominio)
 * con sus implementaciones Prisma. Los casos de uso inyectan los tokens y no
 * conocen esta clase ni Prisma (Dependency Inversion). Es @Global para no
 * repetir imports en cada módulo de feature de la próxima etapa.
 *
 * Los repositorios "sueltos" (fuera de transacción) se construyen con el
 * PrismaService. Para operaciones atómicas multi-agregado, los casos de uso
 * usan UNIT_OF_WORK, que crea repositorios ligados a la transacción.
 */
@Global()
@Module({
  providers: [
    PrismaService,
    { provide: UNIT_OF_WORK, useClass: PrismaUnitOfWork },
    { provide: CATEGORY_REPOSITORY, useFactory: (p: PrismaService) => new CategoryRepository(p), inject: [PrismaService] },
    { provide: DIFFICULTY_LEVEL_REPOSITORY, useFactory: (p: PrismaService) => new DifficultyLevelRepository(p), inject: [PrismaService] },
    { provide: QUESTION_TYPE_REPOSITORY, useFactory: (p: PrismaService) => new QuestionTypeRepository(p), inject: [PrismaService] },
    { provide: QUESTION_REPOSITORY, useFactory: (p: PrismaService) => new QuestionRepository(p), inject: [PrismaService] },
    { provide: USER_REPOSITORY, useFactory: (p: PrismaService) => new UserRepository(p), inject: [PrismaService] },
    { provide: ACHIEVEMENT_REPOSITORY, useFactory: (p: PrismaService) => new AchievementRepository(p), inject: [PrismaService] },
    { provide: USER_ACHIEVEMENT_REPOSITORY, useFactory: (p: PrismaService) => new UserAchievementRepository(p), inject: [PrismaService] },
    { provide: GAME_SESSION_REPOSITORY, useFactory: (p: PrismaService) => new GameSessionRepository(p), inject: [PrismaService] },
  ],
  exports: [
    PrismaService,
    UNIT_OF_WORK,
    CATEGORY_REPOSITORY,
    DIFFICULTY_LEVEL_REPOSITORY,
    QUESTION_TYPE_REPOSITORY,
    QUESTION_REPOSITORY,
    USER_REPOSITORY,
    ACHIEVEMENT_REPOSITORY,
    USER_ACHIEVEMENT_REPOSITORY,
    GAME_SESSION_REPOSITORY,
  ],
})
export class PersistenceModule {}
