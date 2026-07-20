import { Prisma } from '@prisma/client';
import {
  ICategoryRepository,
  IDifficultyLevelRepository,
  IQuestionTypeRepository,
} from 'src/domain/repositories/repositories';
import { Category } from 'src/domain/entities/category.entity';
import { DifficultyLevel } from 'src/domain/entities/difficulty-level.entity';
import { QuestionType } from 'src/domain/entities/question-type.entity';
import { DomainMappers } from '../mappers/domain.mappers';

/**
 * Cada repositorio recibe un cliente Prisma que puede ser el PrismaService
 * (operaciones sueltas) o un cliente de transacción (Prisma.TransactionClient)
 * cuando lo construye el UnitOfWork. Así el mismo repositorio sirve dentro y
 * fuera de una transacción.
 */
type TxClient = Prisma.TransactionClient;

export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly db: TxClient) {}

  async findById(id: string): Promise<Category | null> {
    const row = await this.db.category.findUnique({ where: { id } });
    return row ? DomainMappers.toCategory(row) : null;
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.db.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map(DomainMappers.toCategory);
  }

  async findActive(): Promise<Category[]> {
    const rows = await this.db.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    return rows.map(DomainMappers.toCategory);
  }

  async add(category: Category): Promise<void> {
    await this.db.category.create({
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        iconUrl: category.iconUrl,
        isActive: category.isActive,
      },
    });
  }

  async update(category: Category): Promise<void> {
    await this.db.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        description: category.description,
        iconUrl: category.iconUrl,
        isActive: category.isActive,
      },
    });
  }
}

export class DifficultyLevelRepository implements IDifficultyLevelRepository {
  constructor(private readonly db: TxClient) {}

  async findById(id: string): Promise<DifficultyLevel | null> {
    const row = await this.db.difficultyLevel.findUnique({ where: { id } });
    return row ? DomainMappers.toDifficulty(row) : null;
  }

  async findAllOrdered(): Promise<DifficultyLevel[]> {
    const rows = await this.db.difficultyLevel.findMany({ orderBy: { order: 'asc' } });
    return rows.map(DomainMappers.toDifficulty);
  }

  async add(level: DifficultyLevel): Promise<void> {
    await this.db.difficultyLevel.create({
      data: { id: level.id, name: level.name, score: level.score, order: level.order },
    });
  }
}

export class QuestionTypeRepository implements IQuestionTypeRepository {
  constructor(private readonly db: TxClient) {}

  async findById(id: string): Promise<QuestionType | null> {
    const row = await this.db.questionType.findUnique({ where: { id } });
    return row ? DomainMappers.toQuestionType(row) : null;
  }

  async findByCode(code: string): Promise<QuestionType | null> {
    const row = await this.db.questionType.findUnique({ where: { code } });
    return row ? DomainMappers.toQuestionType(row) : null;
  }

  async findAll(): Promise<QuestionType[]> {
    const rows = await this.db.questionType.findMany();
    return rows.map(DomainMappers.toQuestionType);
  }

  async add(type: QuestionType): Promise<void> {
    await this.db.questionType.create({
      data: { id: type.id, code: type.code, name: type.name, isActive: type.isActive },
    });
  }
}
