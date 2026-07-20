import { Category } from '../entities/category.entity';
import { DifficultyLevel } from '../entities/difficulty-level.entity';
import { QuestionType } from '../entities/question-type.entity';
import { Question } from '../entities/question.entity';
import { User } from '../entities/user.entity';
import { Achievement, UserAchievement } from '../entities/achievement.entity';
import { GameSession } from '../entities/game-session.entity';

/**
 * Contratos de repositorio (interfaces). Viven en el dominio, sin conocer
 * Prisma. Infrastructure las implementa. Se registran en DI usando los tokens
 * de repository.tokens.ts.
 *
 * Nota de diseño: no se define un IRepository<T> genérico con save() suelto,
 * porque en NestJS/Prisma la persistencia transaccional se coordina mejor a
 * través del UnitOfWork, que expone los repositorios ligados a una misma
 * transacción.
 */

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findActive(): Promise<Category[]>;
  add(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
}

export interface IDifficultyLevelRepository {
  findById(id: string): Promise<DifficultyLevel | null>;
  findAllOrdered(): Promise<DifficultyLevel[]>;
  add(level: DifficultyLevel): Promise<void>;
}

export interface IQuestionTypeRepository {
  findById(id: string): Promise<QuestionType | null>;
  findByCode(code: string): Promise<QuestionType | null>;
  findAll(): Promise<QuestionType[]>;
  add(type: QuestionType): Promise<void>;
}

export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  findWithAnswers(id: string): Promise<Question | null>;
  add(question: Question): Promise<void>;
  update(question: Question): Promise<void>;

  /**
   * Candidatas para el motor de selección: publicadas, filtradas por
   * categorías y nivel de dificultad, excluyendo ids ya descartados por el
   * llamador. No aplica la lógica de "visto recientemente" (eso lo resuelve
   * el motor combinando con GameSessionRepository).
   */
  findCandidates(params: {
    categoryIds: string[];
    difficultyLevelId: string;
    excludedQuestionIds: string[];
  }): Promise<Question[]>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  emailExists(email: string): Promise<boolean>;
  topByXp(count: number): Promise<User[]>;
  add(user: User): Promise<void>;
  update(user: User): Promise<void>;
}

export interface IAchievementRepository {
  findById(id: string): Promise<Achievement | null>;
  findAll(): Promise<Achievement[]>;
  add(achievement: Achievement): Promise<void>;
}

export interface IUserAchievementRepository {
  findByUserId(userId: string): Promise<UserAchievement[]>;
  hasUnlocked(userId: string, achievementId: string): Promise<boolean>;
  add(userAchievement: UserAchievement): Promise<void>;
}

export interface IGameSessionRepository {
  findById(id: string): Promise<GameSession | null>;
  historyByUser(userId: string, page: number, pageSize: number): Promise<GameSession[]>;
  add(session: GameSession): Promise<void>;
  update(session: GameSession): Promise<void>;

  /**
   * Ids de preguntas respondidas por el usuario dentro de la ventana reciente
   * (en días). Insumo clave del motor de selección para evitar repeticiones.
   */
  recentlyAnsweredQuestionIds(userId: string, lookbackDays: number): Promise<string[]>;
}

/**
 * Unit of Work: ejecuta un bloque de trabajo dentro de una transacción,
 * exponiendo repositorios ligados a esa transacción. Garantiza atomicidad
 * cuando una operación toca varios agregados (p. ej. completar una partida:
 * GameSession + User + UserStatistics + UserAchievement).
 */
export interface UnitOfWorkRepositories {
  categories: ICategoryRepository;
  difficultyLevels: IDifficultyLevelRepository;
  questionTypes: IQuestionTypeRepository;
  questions: IQuestionRepository;
  users: IUserRepository;
  achievements: IAchievementRepository;
  userAchievements: IUserAchievementRepository;
  gameSessions: IGameSessionRepository;
}

export interface IUnitOfWork {
  execute<T>(work: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
