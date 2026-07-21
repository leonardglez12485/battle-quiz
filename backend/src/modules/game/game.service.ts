import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameSession } from 'src/domain/entities/game-session.entity';
import { GameSessionStatus } from 'src/domain/enums';
import {
  IDifficultyLevelRepository,
  IGameSessionRepository,
  IQuestionRepository,
  IQuestionTypeRepository,
  IUnitOfWork,
} from 'src/domain/repositories/repositories';
import {
  DIFFICULTY_LEVEL_REPOSITORY,
  GAME_SESSION_REPOSITORY,
  QUESTION_REPOSITORY,
  QUESTION_TYPE_REPOSITORY,
  UNIT_OF_WORK,
} from 'src/domain/repositories/repository.tokens';
import { QuestionSelectionEngine } from 'src/application/game-engine/question-selection.engine';
import { QUESTION_SELECTION_ENGINE } from 'src/application/game-engine/question-selection.types';
import {
  ANSWER_EVALUATION_RESOLVER,
  AnswerEvaluationResolver,
} from 'src/application/evaluation/answer-evaluation';
import { evaluateAchievements } from 'src/application/evaluation/achievement-evaluator';
import { UserAchievement } from 'src/domain/entities/achievement.entity';
import {
  AudienceVote,
  CompleteGameResponse,
  GameQuestionDto,
  LifelineDto,
  LifelineResponse,
  StartGameDto,
  StartGameResponse,
  SubmitAnswerDto,
  SubmitAnswerResponse,
} from './game.dto';

/**
 * Casos de uso del juego. Tres operaciones:
 *  - start: arma la partida con el motor de selección (distribución de
 *    dificultad configurable) y la persiste en estado InProgress.
 *  - answer: evalúa en el SERVIDOR (nunca en el cliente) usando la estrategia
 *    del tipo de pregunta, registra la respuesta y devuelve el veredicto +
 *    explicación educativa.
 *  - complete: cierra la partida en una única transacción (Unit of Work):
 *    sesión + XP/monedas/estadísticas del usuario + racha diaria + logros.
 */
@Injectable()
export class GameService {
  /**
   * Distribución de dificultad por defecto (proporciones sobre los niveles
   * ordenados de más fácil a más difícil). Configurable por partida vía
   * totalQuestions; las proporciones pueden moverse a variables de entorno
   * si se quiere afinar sin redeploy.
   */
  private static readonly DefaultDistribution = [0.3, 0.3, 0.2, 0.1, 0.1];
  private static readonly DefaultTotalQuestions = 10;
  private static readonly CoinsPerPoints = 5; // 1 moneda cada 5 puntos

  constructor(
    @Inject(QUESTION_SELECTION_ENGINE) private readonly selectionEngine: QuestionSelectionEngine,
    @Inject(ANSWER_EVALUATION_RESOLVER) private readonly evaluationResolver: AnswerEvaluationResolver,
    @Inject(QUESTION_REPOSITORY) private readonly questions: IQuestionRepository,
    @Inject(QUESTION_TYPE_REPOSITORY) private readonly questionTypes: IQuestionTypeRepository,
    @Inject(DIFFICULTY_LEVEL_REPOSITORY) private readonly difficulties: IDifficultyLevelRepository,
    @Inject(GAME_SESSION_REPOSITORY) private readonly gameSessions: IGameSessionRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async start(userId: string, dto: StartGameDto): Promise<StartGameResponse> {
    const total = dto.totalQuestions ?? GameService.DefaultTotalQuestions;
    const levels = await this.difficulties.findAllOrdered();
    if (levels.length === 0) {
      throw new BadRequestException('No hay niveles de dificultad configurados.');
    }

    const distribution = this.buildDistribution(levels.map((l) => l.id), total);

    const selected = await this.selectionEngine.select({
      userId,
      categoryIds: dto.categoryIds ?? [],
      difficultyDistribution: distribution,
    });

    if (selected.length === 0) {
      throw new BadRequestException('No hay preguntas disponibles para esta configuración.');
    }

    const session = GameSession.start(userId, dto.mode);
    await this.gameSessions.add(session);

    // Los tipos se resuelven una vez para incluir el código (la app lo usa
    // para elegir el layout de la pregunta).
    const types = await this.questionTypes.findAll();
    const typeCodeById = new Map(types.map((t) => [t.id, t.code]));

    const questions: GameQuestionDto[] = selected.map((q) => ({
      id: q.id,
      text: q.text,
      categoryId: q.categoryId,
      difficultyLevelId: q.difficultyLevelId,
      questionTypeCode: typeCodeById.get(q.questionTypeId) ?? 'multiple_choice',
      answers: [...q.answers]
        .sort((a, b) => a.order - b.order)
        .map((a) => ({ id: a.id, text: a.text, order: a.order })),
    }));

    return { sessionId: session.id, mode: dto.mode, questions };
  }

  async submitAnswer(userId: string, dto: SubmitAnswerDto): Promise<SubmitAnswerResponse> {
    const session = await this.gameSessions.findById(dto.sessionId);
    if (!session) throw new NotFoundException('La partida no existe.');
    if (session.userId !== userId) throw new ForbiddenException('La partida no pertenece a este usuario.');
    if (session.status !== GameSessionStatus.InProgress) {
      throw new BadRequestException('La partida ya finalizó.');
    }

    const question = await this.questions.findWithAnswers(dto.questionId);
    if (!question) throw new NotFoundException('La pregunta no existe.');

    const type = await this.questionTypes.findById(question.questionTypeId);
    const strategy = this.evaluationResolver.resolve(type?.code ?? 'multiple_choice');

    const isCorrect = strategy.evaluate(question, {
      selectedAnswerId: dto.selectedAnswerId ?? null,
      selectedAnswerIds: dto.selectedAnswerIds ?? null,
      writtenText: dto.writtenText ?? null,
    });

    const difficulty = await this.difficulties.findById(question.difficultyLevelId);
    const pointsAwarded = isCorrect ? (difficulty?.score ?? 10) : 0;

    session.recordAnswer({
      questionId: question.id,
      selectedAnswerId: dto.selectedAnswerId ?? null,
      writtenAnswer: dto.writtenText ?? null,
      isCorrect,
      timeTakenSeconds: dto.timeTakenSeconds,
      pointsAwarded,
    });
    await this.gameSessions.update(session);

    return {
      isCorrect,
      correctAnswerIds: question.answers.filter((a) => a.isCorrect).map((a) => a.id),
      explanation: question.educationalExplanation,
      pointsAwarded,
    };
  }

  /**
   * Comodines que requieren conocer la respuesta correcta: se resuelven en el
   * servidor para no filtrarla al cliente.
   *  - fifty_fifty: devuelve hasta 2 respuestas incorrectas para ocultar.
   *  - audience: devuelve una distribución de "votos" sesgada hacia la
   *    correcta (simula el público), sin decir explícitamente cuál es.
   */
  async lifeline(userId: string, dto: LifelineDto): Promise<LifelineResponse> {
    const session = await this.gameSessions.findById(dto.sessionId);
    if (!session) throw new NotFoundException('La partida no existe.');
    if (session.userId !== userId) throw new ForbiddenException('La partida no pertenece a este usuario.');
    if (session.status !== GameSessionStatus.InProgress) {
      throw new BadRequestException('La partida ya finalizó.');
    }

    const question = await this.questions.findWithAnswers(dto.questionId);
    if (!question) throw new NotFoundException('La pregunta no existe.');

    const answers = [...question.answers].sort((a, b) => a.order - b.order);
    const wrong = answers.filter((a) => !a.isCorrect);

    if (dto.type === 'fifty_fifty') {
      const shuffled = [...wrong].sort(() => Math.random() - 0.5);
      // Oculta 2, pero nunca deja menos de 2 opciones visibles.
      const maxToRemove = Math.max(0, answers.length - 2);
      const removeAnswerIds = shuffled.slice(0, Math.min(2, maxToRemove)).map((a) => a.id);
      return { removeAnswerIds };
    }

    return { audience: this.buildAudience(answers.map((a) => ({ id: a.id, isCorrect: a.isCorrect }))) };
  }

  /** Reparte 100% sesgando hacia la(s) correcta(s); devuelve enteros que suman 100. */
  private buildAudience(answers: { id: string; isCorrect: boolean }[]): AudienceVote[] {
    const correctCount = answers.filter((a) => a.isCorrect).length || 1;
    const correctShare = 55 + Math.floor(Math.random() * 20); // 55–74% al total correcto
    const perCorrect = Math.floor(correctShare / correctCount);
    const wrong = answers.filter((a) => !a.isCorrect);

    const votes: AudienceVote[] = answers.map((a) => ({
      answerId: a.id,
      percent: a.isCorrect ? perCorrect : 0,
    }));

    // Reparto del resto entre las incorrectas con algo de aleatoriedad.
    let remaining = 100 - perCorrect * correctCount;
    wrong.forEach((w, i) => {
      const isLast = i === wrong.length - 1;
      const share = isLast ? remaining : Math.floor(Math.random() * (remaining / Math.max(1, wrong.length - i)));
      const v = votes.find((x) => x.answerId === w.id)!;
      v.percent = share;
      remaining -= share;
    });

    return votes;
  }

  async complete(userId: string, sessionId: string): Promise<CompleteGameResponse> {
    return this.uow.execute(async (repos) => {
      const session = await repos.gameSessions.findById(sessionId);
      if (!session) throw new NotFoundException('La partida no existe.');
      if (session.userId !== userId) throw new ForbiddenException('La partida no pertenece a este usuario.');
      if (session.status !== GameSessionStatus.InProgress) {
        throw new BadRequestException('La partida ya finalizó.');
      }

      const user = await repos.users.findById(userId);
      if (!user) throw new NotFoundException('El usuario no existe.');

      const answers = [...session.questions];
      const total = answers.length;
      const correct = answers.filter((a) => a.isCorrect).length;
      const points = answers.reduce((sum, a) => sum + a.pointsAwarded, 0);
      const xp = points; // XP = puntos (regla simple; ajustable sin tocar dominio)
      const coins = Math.floor(points / GameService.CoinsPerPoints);
      const bestStreak = session.calculateStreak();
      const avgTime = total === 0 ? 0 : answers.reduce((s, a) => s + a.timeTakenSeconds, 0) / total;

      session.complete(xp, points);
      await repos.gameSessions.update(session);

      const levelsGained = user.completeGame({
        xpEarned: xp,
        coinsEarned: coins,
        questionsAnswered: total,
        correctAnswers: correct,
        averageResponseTimeSec: avgTime,
        streakInGame: bestStreak,
      });
      user.registerDailyPlay(new Date().toISOString().slice(0, 10));

      // Logros: evaluar contra el estado ya actualizado del usuario.
      const [allAchievements, mine] = await Promise.all([
        repos.achievements.findAll(),
        repos.userAchievements.findByUserId(userId),
      ]);
      const unlocked = evaluateAchievements({
        user,
        allAchievements,
        alreadyUnlockedIds: new Set(mine.map((m) => m.achievementId)),
        lastGamePerfect: total > 0 && correct === total,
      });
      for (const achievement of unlocked) {
        await repos.userAchievements.add(UserAchievement.unlock(userId, achievement.id));
      }

      await repos.users.update(user);

      return {
        correct,
        total,
        xpEarned: xp,
        coinsEarned: coins,
        pointsEarned: points,
        bestStreakInGame: bestStreak,
        levelsGained,
        newLevel: user.level,
        unlockedAchievements: unlocked.map((a) => ({
          code: a.code,
          name: a.name,
          description: a.description,
        })),
      };
    });
  }

  /** Reparte `total` entre los niveles según DefaultDistribution (resto → primer nivel). */
  private buildDistribution(levelIds: string[], total: number): Record<string, number> {
    const proportions = GameService.DefaultDistribution;
    const result: Record<string, number> = {};
    let assigned = 0;

    levelIds.forEach((id, i) => {
      const p = proportions[i] ?? 0;
      const count = Math.floor(total * p);
      result[id] = count;
      assigned += count;
    });

    // El resto (por redondeo o más niveles que proporciones) va a los primeros niveles.
    let remainder = total - assigned;
    for (let i = 0; remainder > 0 && levelIds.length > 0; i = (i + 1) % levelIds.length) {
      result[levelIds[i]] += 1;
      remainder--;
    }

    return result;
  }
}
