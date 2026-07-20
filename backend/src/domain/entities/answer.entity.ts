import { BaseEntity } from './base.entity';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Respuesta de una pregunta. No es agregado propio: solo existe dentro del
 * agregado Question y se crea a través de él.
 */
export class Answer extends BaseEntity {
  private readonly _questionId: string;
  private _text: string;
  private _isCorrect: boolean;
  private _order: number;

  private constructor(
    questionId: string,
    text: string,
    isCorrect: boolean,
    order: number,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date | null,
  ) {
    super(id, createdAt, updatedAt);
    this._questionId = questionId;
    this._text = text;
    this._isCorrect = isCorrect;
    this._order = order;
  }

  /** Solo debe llamarse desde el agregado Question. */
  static createInternal(questionId: string, text: string, isCorrect: boolean, order: number): Answer {
    if (!text || !text.trim()) {
      throw new DomainException('El texto de la respuesta es obligatorio.');
    }
    if (order < 0) {
      throw new DomainException('El orden de la respuesta no puede ser negativo.');
    }
    return new Answer(questionId, text.trim(), isCorrect, order);
  }

  static fromPersistence(props: {
    id: string;
    questionId: string;
    text: string;
    isCorrect: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date | null;
  }): Answer {
    return new Answer(
      props.questionId,
      props.text,
      props.isCorrect,
      props.order,
      props.id,
      props.createdAt,
      props.updatedAt,
    );
  }

  get questionId(): string {
    return this._questionId;
  }
  get text(): string {
    return this._text;
  }
  get isCorrect(): boolean {
    return this._isCorrect;
  }
  get order(): number {
    return this._order;
  }
}
