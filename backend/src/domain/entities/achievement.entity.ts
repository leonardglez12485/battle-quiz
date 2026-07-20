import { BaseEntity } from './base.entity';
import { AchievementCriteriaType } from '../enums';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Definición de un logro. Estructura flexible: cualquier cantidad de logros
 * se agrega por seed combinando criteriaType + targetValue, sin tocar código.
 * La evaluación de "¿se cumplió?" vive en application (AchievementEvaluation),
 * que sabe leer cada criterio desde User/UserStatistics.
 */
export class Achievement extends BaseEntity {
  private _code: string;
  private _name: string;
  private _description: string;
  private _iconUrl: string | null;
  private _criteriaType: AchievementCriteriaType;
  private _targetValue: number;

  private constructor(props: {
    code: string;
    name: string;
    description: string;
    iconUrl: string | null;
    criteriaType: AchievementCriteriaType;
    targetValue: number;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this._code = props.code;
    this._name = props.name;
    this._description = props.description;
    this._iconUrl = props.iconUrl;
    this._criteriaType = props.criteriaType;
    this._targetValue = props.targetValue;
  }

  static create(props: {
    code: string;
    name: string;
    description: string;
    criteriaType: AchievementCriteriaType;
    targetValue: number;
    iconUrl?: string;
  }): Achievement {
    if (!props.code || !props.code.trim()) throw new DomainException('El código del logro es obligatorio.');
    if (props.targetValue <= 0) throw new DomainException('El valor objetivo del logro debe ser mayor a cero.');

    return new Achievement({
      code: props.code.trim(),
      name: props.name.trim(),
      description: props.description.trim(),
      iconUrl: props.iconUrl ?? null,
      criteriaType: props.criteriaType,
      targetValue: props.targetValue,
    });
  }

  static fromPersistence(props: {
    id: string;
    code: string;
    name: string;
    description: string;
    iconUrl: string | null;
    criteriaType: AchievementCriteriaType;
    targetValue: number;
    createdAt: Date;
    updatedAt: Date | null;
  }): Achievement {
    return new Achievement(props);
  }

  get code(): string {
    return this._code;
  }
  get name(): string {
    return this._name;
  }
  get description(): string {
    return this._description;
  }
  get iconUrl(): string | null {
    return this._iconUrl;
  }
  get criteriaType(): AchievementCriteriaType {
    return this._criteriaType;
  }
  get targetValue(): number {
    return this._targetValue;
  }
}

/**
 * Relación N:M entre User y Achievement con fecha de desbloqueo. Entidad
 * propia (no un simple join) porque tiene datos y podría crecer.
 */
export class UserAchievement extends BaseEntity {
  private readonly _userId: string;
  private readonly _achievementId: string;
  private readonly _unlockedAt: Date;

  private constructor(userId: string, achievementId: string, unlockedAt: Date, id?: string, createdAt?: Date) {
    super(id, createdAt);
    this._userId = userId;
    this._achievementId = achievementId;
    this._unlockedAt = unlockedAt;
  }

  static unlock(userId: string, achievementId: string): UserAchievement {
    return new UserAchievement(userId, achievementId, new Date());
  }

  static fromPersistence(props: {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: Date;
    createdAt: Date;
  }): UserAchievement {
    return new UserAchievement(props.userId, props.achievementId, props.unlockedAt, props.id, props.createdAt);
  }

  get userId(): string {
    return this._userId;
  }
  get achievementId(): string {
    return this._achievementId;
  }
  get unlockedAt(): Date {
    return this._unlockedAt;
  }
}
