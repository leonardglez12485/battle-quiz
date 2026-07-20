import { Prisma } from '@prisma/client';
import { IQuestionRepository } from 'src/domain/repositories/repositories';
import { Question } from 'src/domain/entities/question.entity';
import { QuestionStatus } from 'src/domain/enums';
import { DomainMappers } from '../mappers/domain.mappers';

type TxClient = Prisma.TransactionClient;

export class QuestionRepository implements IQuestionRepository {
  constructor(private readonly db: TxClient) {}

  async findById(id: string): Promise<Question | null> {
    const row = await this.db.question.findUnique({ where: { id }, include: { answers: true } });
    return row ? DomainMappers.toQuestion(row) : null;
  }

  findWithAnswers(id: string): Promise<Question | null> {
    return this.findById(id);
  }

  async add(question: Question): Promise<void> {
    await this.db.question.create({
      data: {
        id: question.id,
        categoryId: question.categoryId,
        difficultyLevelId: question.difficultyLevelId,
        questionTypeId: question.questionTypeId,
        text: question.text,
        educationalExplanation: question.educationalExplanation,
        status: question.status,
        answers: {
          create: question.answers.map((a) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
            order: a.order,
          })),
        },
      },
    });
  }

  async update(question: Question): Promise<void> {
    // Reemplaza el conjunto de respuestas del agregado de forma atómica.
    await this.db.answer.deleteMany({ where: { questionId: question.id } });
    await this.db.question.update({
      where: { id: question.id },
      data: {
        categoryId: question.categoryId,
        difficultyLevelId: question.difficultyLevelId,
        questionTypeId: question.questionTypeId,
        text: question.text,
        educationalExplanation: question.educationalExplanation,
        status: question.status,
        answers: {
          create: question.answers.map((a) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
            order: a.order,
          })),
        },
      },
    });
  }

  async findCandidates(params: {
    categoryIds: string[];
    difficultyLevelId: string;
    excludedQuestionIds: string[];
  }): Promise<Question[]> {
    const where: Prisma.QuestionWhereInput = {
      status: QuestionStatus.Published,
      difficultyLevelId: params.difficultyLevelId,
    };

    if (params.categoryIds.length > 0) {
      where.categoryId = { in: params.categoryIds };
    }
    if (params.excludedQuestionIds.length > 0) {
      where.id = { notIn: params.excludedQuestionIds };
    }

    const rows = await this.db.question.findMany({ where, include: { answers: true } });
    return rows.map(DomainMappers.toQuestion);
  }
}
