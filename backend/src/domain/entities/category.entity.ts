import { BaseEntity } from './base.entity';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Categoría de preguntas. Catálogo en BD por requisito explícito: nunca
 * hardcodeada. Agregar una categoría = insertar una fila.
 */
export class Category extends BaseEntity {
  private _name: string;
  private _description: string | null;
  private _iconUrl: string | null;
  private _isActive: boolean;

  private constructor(
    name: string,
    description: string | null,
    iconUrl: string | null,
    isActive: boolean,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date | null,
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._description = description;
    this._iconUrl = iconUrl;
    this._isActive = isActive;
  }

  static create(name: string, description?: string, iconUrl?: string): Category {
    if (!name || !name.trim()) {
      throw new DomainException('El nombre de la categoría es obligatorio.');
    }
    return new Category(name.trim(), description ?? null, iconUrl ?? null, true);
  }

  /** Rehidrata desde persistencia sin re-ejecutar validaciones de creación. */
  static fromPersistence(props: {
    id: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date | null;
  }): Category {
    return new Category(
      props.name,
      props.description,
      props.iconUrl,
      props.isActive,
      props.id,
      props.createdAt,
      props.updatedAt,
    );
  }

  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get iconUrl(): string | null {
    return this._iconUrl;
  }
  get isActive(): boolean {
    return this._isActive;
  }

  rename(name: string): void {
    if (!name || !name.trim()) {
      throw new DomainException('El nombre de la categoría es obligatorio.');
    }
    this._name = name.trim();
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }
}
