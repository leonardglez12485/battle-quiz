import { BaseEntity } from './base.entity';

/**
 * Estadísticas agregadas de un usuario (1:1 con User). Se actualizan
 * incrementalmente al completar cada partida para no recalcular sobre todo
 * el historial. No es agregado propio: solo se modifica desde User.
 */
export class UserStatistics extends BaseEntity {
  private readonly _userId: string;
  private _questionsAnswered: number;
  private _correctAnswers: number;
  private _incorrectAnswers: number;
  private _averageResponseTimeSec: number;
  private _longestStreak: number;
  private _favoriteCategoryId: string | null;
  private _bestPerformingCategoryId: string | null;
  private _worstPerformingCategoryId: string | null;

  private constructor(props: {
    userId: string;
    questionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageResponseTimeSec: number;
    longestStreak: number;
    favoriteCategoryId: string | null;
    bestPerformingCategoryId: string | null;
    worstPerformingCategoryId: string | null;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this._userId = props.userId;
    this._questionsAnswered = props.questionsAnswered;
    this._correctAnswers = props.correctAnswers;
    this._incorrectAnswers = props.incorrectAnswers;
    this._averageResponseTimeSec = props.averageResponseTimeSec;
    this._longestStreak = props.longestStreak;
    this._favoriteCategoryId = props.favoriteCategoryId;
    this._bestPerformingCategoryId = props.bestPerformingCategoryId;
    this._worstPerformingCategoryId = props.worstPerformingCategoryId;
  }

  static createEmpty(userId: string): UserStatistics {
    return new UserStatistics({
      userId,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageResponseTimeSec: 0,
      longestStreak: 0,
      favoriteCategoryId: null,
      bestPerformingCategoryId: null,
      worstPerformingCategoryId: null,
    });
  }

  static fromPersistence(props: {
    id: string;
    userId: string;
    questionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageResponseTimeSec: number;
    longestStreak: number;
    favoriteCategoryId: string | null;
    bestPerformingCategoryId: string | null;
    worstPerformingCategoryId: string | null;
    createdAt: Date;
    updatedAt: Date | null;
  }): UserStatistics {
    return new UserStatistics(props);
  }

  get userId(): string {
    return this._userId;
  }
  get questionsAnswered(): number {
    return this._questionsAnswered;
  }
  get correctAnswers(): number {
    return this._correctAnswers;
  }
  get incorrectAnswers(): number {
    return this._incorrectAnswers;
  }
  get averageResponseTimeSec(): number {
    return this._averageResponseTimeSec;
  }
  get longestStreak(): number {
    return this._longestStreak;
  }
  get favoriteCategoryId(): string | null {
    return this._favoriteCategoryId;
  }
  get bestPerformingCategoryId(): string | null {
    return this._bestPerformingCategoryId;
  }
  get worstPerformingCategoryId(): string | null {
    return this._worstPerformingCategoryId;
  }

  get accuracyPercentage(): number {
    if (this._questionsAnswered === 0) return 0;
    return Math.round((this._correctAnswers * 10000) / this._questionsAnswered) / 100;
  }

  /** Se invoca desde User.completeGame(...) para mantener consistencia. */
  registerGameResult(answered: number, correct: number, averageResponseTimeSec: number, streakInGame: number): void {
    const totalTimeSoFar = this._averageResponseTimeSec * this._questionsAnswered;

    this._questionsAnswered += answered;
    this._correctAnswers += correct;
    this._incorrectAnswers += answered - correct;

    this._averageResponseTimeSec =
      this._questionsAnswered === 0
        ? 0
        : Math.round(((totalTimeSoFar + averageResponseTimeSec * answered) / this._questionsAnswered) * 100) / 100;

    if (streakInGame > this._longestStreak) {
      this._longestStreak = streakInGame;
    }
    this.touch();
  }

  setFavoriteCategory(categoryId: string): void {
    this._favoriteCategoryId = categoryId;
    this.touch();
  }
  setBestPerformingCategory(categoryId: string): void {
    this._bestPerformingCategoryId = categoryId;
    this.touch();
  }
  setWorstPerformingCategory(categoryId: string): void {
    this._worstPerformingCategoryId = categoryId;
    this.touch();
  }
}
