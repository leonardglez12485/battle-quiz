import { randomUUID } from 'crypto';

/**
 * Base de toda entidad de dominio. Identidad + auditoría. El id se genera en
 * el dominio (uuid) para que la entidad sea válida antes de persistirse (útil
 * para tests sin base de datos y para construir agregados en memoria).
 */
export abstract class BaseEntity {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date | null;

  protected constructor(id?: string, createdAt?: Date, updatedAt?: Date | null) {
    this._id = id ?? randomUUID();
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? null;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  /** Invocar desde cualquier método que mute el estado del agregado. */
  protected touch(): void {
    this._updatedAt = new Date();
  }

  equals(other?: BaseEntity): boolean {
    if (!other) return false;
    if (this === other) return true;
    if (this.constructor !== other.constructor) return false;
    return this._id === other._id;
  }
}
