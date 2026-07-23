import { randomUUID } from 'crypto';
import { BaseEntity } from './base.entity';
import { UserStatistics } from './user-statistics.entity';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Aggregate Root del jugador. Contiene su UserStatistics (1:1) y protege la
 * progresión: XP, nivel, monedas y racha diaria solo cambian por métodos del
 * agregado, nunca por asignación directa desde un caso de uso.
 */
export class User extends BaseEntity {
  /** XP para pasar de nivel N a N+1 = 100 * N (progresión ajustable a futuro). */
  private static readonly XP_PER_LEVEL_FACTOR = 100;

  private _name: string;
  private readonly _email: string;
  private _passwordHash: string;
  private _avatarUrl: string | null;
  private _country: string | null;
  private readonly _registeredAt: Date;
  private _level: number;
  private _xp: number;
  private _coins: number;
  private _currentDailyStreak: number;
  private _lastPlayedDate: string | null; // ISO yyyy-mm-dd
  private _statistics: UserStatistics;

  private constructor(props: {
    name: string;
    email: string;
    passwordHash: string;
    avatarUrl: string | null;
    country: string | null;
    registeredAt: Date;
    level: number;
    xp: number;
    coins: number;
    currentDailyStreak: number;
    lastPlayedDate: string | null;
    statistics: UserStatistics;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._avatarUrl = props.avatarUrl;
    this._country = props.country;
    this._registeredAt = props.registeredAt;
    this._level = props.level;
    this._xp = props.xp;
    this._coins = props.coins;
    this._currentDailyStreak = props.currentDailyStreak;
    this._lastPlayedDate = props.lastPlayedDate;
    this._statistics = props.statistics;
  }

  static register(props: {
    name: string;
    email: string;
    passwordHash: string;
    country?: string;
    avatarUrl?: string;
  }): User {
    if (!props.name || !props.name.trim()) throw new DomainException('El nombre es obligatorio.');
    if (!props.email || !props.email.trim()) throw new DomainException('El email es obligatorio.');
    if (!props.passwordHash) throw new DomainException('La contraseña es obligatoria.');

    // Se genera el id primero para poder enlazar las estadísticas 1:1 al crearlas.
    const id = randomUUID();
    return new User({
      name: props.name.trim(),
      email: props.email.trim().toLowerCase(),
      passwordHash: props.passwordHash,
      avatarUrl: props.avatarUrl ?? null,
      country: props.country ?? null,
      registeredAt: new Date(),
      level: 1,
      xp: 0,
      coins: 0,
      currentDailyStreak: 0,
      lastPlayedDate: null,
      statistics: UserStatistics.createEmpty(id),
      id,
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    avatarUrl: string | null;
    country: string | null;
    registeredAt: Date;
    level: number;
    xp: number;
    coins: number;
    currentDailyStreak: number;
    lastPlayedDate: string | null;
    statistics: UserStatistics;
    createdAt: Date;
    updatedAt: Date | null;
  }): User {
    return new User(props);
  }

  get name(): string {
    return this._name;
  }
  get email(): string {
    return this._email;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  get country(): string | null {
    return this._country;
  }
  get registeredAt(): Date {
    return this._registeredAt;
  }
  get level(): number {
    return this._level;
  }
  get xp(): number {
    return this._xp;
  }
  get coins(): number {
    return this._coins;
  }
  get currentDailyStreak(): number {
    return this._currentDailyStreak;
  }
  get lastPlayedDate(): string | null {
    return this._lastPlayedDate;
  }
  get statistics(): UserStatistics {
    return this._statistics;
  }

  /**
   * Otorga experiencia y resuelve el ascenso de nivel (puede subir varios de
   * una vez). Devuelve la cantidad de niveles ganados.
   */
  gainExperience(xpEarned: number): number {
    if (xpEarned < 0) throw new DomainException('La experiencia otorgada no puede ser negativa.');

    this._xp += xpEarned;
    let levelsGained = 0;
    while (this._xp >= this._level * User.XP_PER_LEVEL_FACTOR) {
      this._xp -= this._level * User.XP_PER_LEVEL_FACTOR;
      this._level += 1;
      levelsGained += 1;
    }
    this.touch();
    return levelsGained;
  }

  earnCoins(amount: number): void {
    if (amount < 0) throw new DomainException('Las monedas otorgadas no pueden ser negativas.');
    this._coins += amount;
    this.touch();
  }

  /** Gasta monedas (p. ej. al usar un comodín). Falla si el saldo no alcanza. */
  spendCoins(amount: number): void {
    if (amount < 0) throw new DomainException('El costo no puede ser negativo.');
    if (this._coins < amount) throw new DomainException('No tenés monedas suficientes para este comodín.');
    this._coins -= amount;
    this.touch();
  }

  /**
   * Actualiza la racha diaria: +1 si jugó ayer, se mantiene si ya jugó hoy,
   * se reinicia a 1 si hubo un salto. `playDate` en formato yyyy-mm-dd.
   */
  registerDailyPlay(playDate: string): void {
    if (this._lastPlayedDate === playDate) return;

    const yesterday = User.subtractOneDay(playDate);
    this._currentDailyStreak = this._lastPlayedDate === yesterday ? this._currentDailyStreak + 1 : 1;
    this._lastPlayedDate = playDate;
    this.touch();
  }

  /** Aplica el resultado de una partida completada al agregado. */
  completeGame(params: {
    xpEarned: number;
    coinsEarned: number;
    questionsAnswered: number;
    correctAnswers: number;
    averageResponseTimeSec: number;
    streakInGame: number;
  }): number {
    const levelsGained = this.gainExperience(params.xpEarned);
    this.earnCoins(params.coinsEarned);
    this._statistics.registerGameResult(
      params.questionsAnswered,
      params.correctAnswers,
      params.averageResponseTimeSec,
      params.streakInGame,
    );
    return levelsGained;
  }

  updateProfile(avatarUrl: string | null, country: string | null): void {
    this._avatarUrl = avatarUrl;
    this._country = country;
    this.touch();
  }

  private static subtractOneDay(isoDate: string): string {
    const d = new Date(isoDate + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
}
