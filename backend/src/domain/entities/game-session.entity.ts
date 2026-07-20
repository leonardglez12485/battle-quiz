import { BaseEntity } from './base.entity';
import { GameMode, GameSessionStatus } from '../enums';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Respuesta dada a una pregunta dentro de una partida. No es agregado propio.
 */
export class GameSessionQuestion extends BaseEntity {
  private readonly _gameSessionId: string;
  private readonly _questionId: string;
  private readonly _selectedAnswerId: string | null;
  private readonly _writtenAnswer: string | null;
  private readonly _isCorrect: boolean;
  private readonly _timeTakenSeconds: number;
  private readonly _pointsAwarded: number;
  private readonly _order: number;

  constructor(props: {
    gameSessionId: string;
    questionId: string;
    selectedAnswerId: string | null;
    writtenAnswer: string | null;
    isCorrect: boolean;
    timeTakenSeconds: number;
    pointsAwarded: number;
    order: number;
    id?: string;
    createdAt?: Date;
  }) {
    super(props.id, props.createdAt);
    this._gameSessionId = props.gameSessionId;
    this._questionId = props.questionId;
    this._selectedAnswerId = props.selectedAnswerId;
    this._writtenAnswer = props.writtenAnswer;
    this._isCorrect = props.isCorrect;
    this._timeTakenSeconds = props.timeTakenSeconds;
    this._pointsAwarded = props.pointsAwarded;
    this._order = props.order;
  }

  get gameSessionId(): string {
    return this._gameSessionId;
  }
  get questionId(): string {
    return this._questionId;
  }
  get selectedAnswerId(): string | null {
    return this._selectedAnswerId;
  }
  get writtenAnswer(): string | null {
    return this._writtenAnswer;
  }
  get isCorrect(): boolean {
    return this._isCorrect;
  }
  get timeTakenSeconds(): number {
    return this._timeTakenSeconds;
  }
  get pointsAwarded(): number {
    return this._pointsAwarded;
  }
  get order(): number {
    return this._order;
  }
}

/**
 * Aggregate Root de una partida (historial). Protege: no repetir una pregunta
 * dentro de la misma partida, y estado terminal una vez Completed/Abandoned.
 */
export class GameSession extends BaseEntity {
  private readonly _userId: string;
  private readonly _mode: GameMode;
  private _status: GameSessionStatus;
  private readonly _startedAt: Date;
  private _completedAt: Date | null;
  private _durationSeconds: number;
  private _xpEarned: number;
  private _pointsEarned: number;
  private readonly _questions: GameSessionQuestion[];

  private constructor(props: {
    userId: string;
    mode: GameMode;
    status: GameSessionStatus;
    startedAt: Date;
    completedAt: Date | null;
    durationSeconds: number;
    xpEarned: number;
    pointsEarned: number;
    questions?: GameSessionQuestion[];
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this._userId = props.userId;
    this._mode = props.mode;
    this._status = props.status;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._durationSeconds = props.durationSeconds;
    this._xpEarned = props.xpEarned;
    this._pointsEarned = props.pointsEarned;
    this._questions = props.questions ?? [];
  }

  static start(userId: string, mode: GameMode): GameSession {
    if (!userId) throw new DomainException('La partida debe pertenecer a un usuario.');
    return new GameSession({
      userId,
      mode,
      status: GameSessionStatus.InProgress,
      startedAt: new Date(),
      completedAt: null,
      durationSeconds: 0,
      xpEarned: 0,
      pointsEarned: 0,
    });
  }

  static fromPersistence(props: {
    id: string;
    userId: string;
    mode: GameMode;
    status: GameSessionStatus;
    startedAt: Date;
    completedAt: Date | null;
    durationSeconds: number;
    xpEarned: number;
    pointsEarned: number;
    questions: GameSessionQuestion[];
    createdAt: Date;
    updatedAt: Date | null;
  }): GameSession {
    return new GameSession(props);
  }

  get userId(): string {
    return this._userId;
  }
  get mode(): GameMode {
    return this._mode;
  }
  get status(): GameSessionStatus {
    return this._status;
  }
  get startedAt(): Date {
    return this._startedAt;
  }
  get completedAt(): Date | null {
    return this._completedAt;
  }
  get durationSeconds(): number {
    return this._durationSeconds;
  }
  get xpEarned(): number {
    return this._xpEarned;
  }
  get pointsEarned(): number {
    return this._pointsEarned;
  }
  get questions(): ReadonlyArray<GameSessionQuestion> {
    return this._questions;
  }

  recordAnswer(params: {
    questionId: string;
    selectedAnswerId: string | null;
    writtenAnswer: string | null;
    isCorrect: boolean;
    timeTakenSeconds: number;
    pointsAwarded: number;
  }): void {
    if (this._status !== GameSessionStatus.InProgress) {
      throw new DomainException('No se pueden registrar respuestas en una partida que ya finalizó.');
    }
    if (this._questions.some((q) => q.questionId === params.questionId)) {
      throw new DomainException('Esta pregunta ya fue respondida en esta partida.');
    }
    this._questions.push(
      new GameSessionQuestion({
        gameSessionId: this.id,
        questionId: params.questionId,
        selectedAnswerId: params.selectedAnswerId,
        writtenAnswer: params.writtenAnswer,
        isCorrect: params.isCorrect,
        timeTakenSeconds: params.timeTakenSeconds,
        pointsAwarded: params.pointsAwarded,
        order: this._questions.length,
      }),
    );
  }

  complete(xpEarned: number, pointsEarned: number): void {
    if (this._status !== GameSessionStatus.InProgress) {
      throw new DomainException('La partida ya fue finalizada.');
    }
    this._status = GameSessionStatus.Completed;
    this._completedAt = new Date();
    this._durationSeconds = Math.floor((this._completedAt.getTime() - this._startedAt.getTime()) / 1000);
    this._xpEarned = xpEarned;
    this._pointsEarned = pointsEarned;
    this.touch();
  }

  abandon(): void {
    if (this._status !== GameSessionStatus.InProgress) return;
    this._status = GameSessionStatus.Abandoned;
    this._completedAt = new Date();
    this._durationSeconds = Math.floor((this._completedAt.getTime() - this._startedAt.getTime()) / 1000);
    this.touch();
  }

  /** Mayor racha de aciertos consecutivos dentro de esta partida. */
  calculateStreak(): number {
    let best = 0;
    let current = 0;
    for (const q of [...this._questions].sort((a, b) => a.order - b.order)) {
      current = q.isCorrect ? current + 1 : 0;
      if (current > best) best = current;
    }
    return best;
  }
}
