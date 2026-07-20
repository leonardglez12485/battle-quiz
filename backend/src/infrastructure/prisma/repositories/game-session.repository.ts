import { Prisma } from '@prisma/client';
import { IGameSessionRepository } from 'src/domain/repositories/repositories';
import { GameSession } from 'src/domain/entities/game-session.entity';
import { DomainMappers } from '../mappers/domain.mappers';

type TxClient = Prisma.TransactionClient;

export class GameSessionRepository implements IGameSessionRepository {
  constructor(private readonly db: TxClient) {}

  async findById(id: string): Promise<GameSession | null> {
    const row = await this.db.gameSession.findUnique({ where: { id }, include: { questions: true } });
    return row ? DomainMappers.toGameSession(row) : null;
  }

  async historyByUser(userId: string, page: number, pageSize: number): Promise<GameSession[]> {
    const rows = await this.db.gameSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { questions: true },
    });
    return rows.map(DomainMappers.toGameSession);
  }

  async add(session: GameSession): Promise<void> {
    await this.db.gameSession.create({
      data: {
        id: session.id,
        userId: session.userId,
        mode: session.mode,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        durationSeconds: session.durationSeconds,
        xpEarned: session.xpEarned,
        pointsEarned: session.pointsEarned,
        questions: {
          create: session.questions.map((q) => ({
            id: q.id,
            questionId: q.questionId,
            selectedAnswerId: q.selectedAnswerId,
            writtenAnswer: q.writtenAnswer,
            isCorrect: q.isCorrect,
            timeTakenSeconds: q.timeTakenSeconds,
            pointsAwarded: q.pointsAwarded,
            order: q.order,
          })),
        },
      },
    });
  }

  async update(session: GameSession): Promise<void> {
    // Actualiza la cabecera e inserta las respuestas nuevas del agregado.
    // Las filas de GameSessionQuestion son inmutables una vez creadas, así
    // que `createMany + skipDuplicates` (única por sesión+pregunta) sincroniza
    // el agregado sin reescribir lo ya persistido.
    await this.db.gameSession.update({
      where: { id: session.id },
      data: {
        status: session.status,
        completedAt: session.completedAt,
        durationSeconds: session.durationSeconds,
        xpEarned: session.xpEarned,
        pointsEarned: session.pointsEarned,
      },
    });

    if (session.questions.length > 0) {
      await this.db.gameSessionQuestion.createMany({
        data: session.questions.map((q) => ({
          id: q.id,
          gameSessionId: session.id,
          questionId: q.questionId,
          selectedAnswerId: q.selectedAnswerId,
          writtenAnswer: q.writtenAnswer,
          isCorrect: q.isCorrect,
          timeTakenSeconds: q.timeTakenSeconds,
          pointsAwarded: q.pointsAwarded,
          order: q.order,
        })),
        skipDuplicates: true,
      });
    }
  }

  async recentlyAnsweredQuestionIds(userId: string, lookbackDays: number): Promise<string[]> {
    const since = new Date();
    since.setDate(since.getDate() - lookbackDays);

    const rows = await this.db.gameSessionQuestion.findMany({
      where: { gameSession: { userId, startedAt: { gte: since } } },
      select: { questionId: true },
      distinct: ['questionId'],
    });
    return rows.map((r) => r.questionId);
  }
}
