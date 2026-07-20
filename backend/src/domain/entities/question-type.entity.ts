import { BaseEntity } from './base.entity';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Tipo de pregunta. Catálogo en BD para cumplir el requisito de
 * extensibilidad: incorporar un tipo nuevo NO debe requerir modificar el
 * dominio. El "cómo se evalúa" vive en application/evaluation como una
 * estrategia resuelta por `code`.
 */
export class QuestionType extends BaseEntity {
  private _code: string;
  private _name: string;
  private _isActive: boolean;

  private constructor(
    code: string,
    name: string,
    isActive: boolean,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date | null,
  ) {
    super(id, createdAt, updatedAt);
    this._code = code;
    this._name = name;
    this._isActive = isActive;
  }

  static create(code: string, name: string): QuestionType {
    if (!code || !code.trim()) {
      throw new DomainException('El código del tipo de pregunta es obligatorio.');
    }
    if (!name || !name.trim()) {
      throw new DomainException('El nombre del tipo de pregunta es obligatorio.');
    }
    return new QuestionType(code.trim().toLowerCase(), name.trim(), true);
  }

  static fromPersistence(props: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date | null;
  }): QuestionType {
    return new QuestionType(props.code, props.name, props.isActive, props.id, props.createdAt, props.updatedAt);
  }

  get code(): string {
    return this._code;
  }
  get name(): string {
    return this._name;
  }
  get isActive(): boolean {
    return this._isActive;
  }
}
