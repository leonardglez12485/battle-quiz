import { BaseEntity } from './base.entity';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Nivel de dificultad. Catálogo en BD (no enum) para poder ajustar el puntaje
 * o incorporar niveles nuevos sin redeployar.
 */
export class DifficultyLevel extends BaseEntity {
  private _name: string;
  private _score: number;
  private _order: number;

  private constructor(
    name: string,
    score: number,
    order: number,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date | null,
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._score = score;
    this._order = order;
  }

  static create(name: string, score: number, order: number): DifficultyLevel {
    if (!name || !name.trim()) {
      throw new DomainException('El nombre del nivel de dificultad es obligatorio.');
    }
    if (score < 0) {
      throw new DomainException('La puntuación no puede ser negativa.');
    }
    return new DifficultyLevel(name.trim(), score, order);
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    score: number;
    order: number;
    createdAt: Date;
    updatedAt: Date | null;
  }): DifficultyLevel {
    return new DifficultyLevel(props.name, props.score, props.order, props.id, props.createdAt, props.updatedAt);
  }

  get name(): string {
    return this._name;
  }
  get score(): number {
    return this._score;
  }
  get order(): number {
    return this._order;
  }

  updateScore(score: number): void {
    if (score < 0) {
      throw new DomainException('La puntuación no puede ser negativa.');
    }
    this._score = score;
    this.touch();
  }
}
