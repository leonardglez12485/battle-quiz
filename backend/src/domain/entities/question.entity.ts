import { BaseEntity } from './base.entity';
import { Answer } from './answer.entity';
import { QuestionStatus } from '../enums';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Aggregate Root del contenido de trivia. Contiene sus respuestas y protege
 * las invariantes: entre 2 y 6 respuestas, al menos una correcta, órdenes
 * únicos. La colección se expone como solo-lectura; toda mutación pasa por
 * métodos de esta clase.
 */
export class Question extends BaseEntity {
  private static readonly MIN_ANSWERS = 2;
  private static readonly MAX_ANSWERS = 6;

  private readonly _categoryId: string;
  private readonly _difficultyLevelId: string;
  private readonly _questionTypeId: string;
  private _text: string;
  private _educationalExplanation: string | null;
  private _status: QuestionStatus;
  private readonly _answers: Answer[];

  private constructor(props: {
    categoryId: string;
    difficultyLevelId: string;
    questionTypeId: string;
    text: string;
    educationalExplanation: string | null;
    status: QuestionStatus;
    answers?: Answer[];
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this._categoryId = props.categoryId;
    this._difficultyLevelId = props.difficultyLevelId;
    this._questionTypeId = props.questionTypeId;
    this._text = props.text;
    this._educationalExplanation = props.educationalExplanation;
    this._status = props.status;
    this._answers = props.answers ?? [];
  }

  static create(props: {
    categoryId: string;
    difficultyLevelId: string;
    questionTypeId: string;
    text: string;
    educationalExplanation?: string;
  }): Question {
    if (!props.categoryId) throw new DomainException('La pregunta debe pertenecer a una categoría.');
    if (!props.difficultyLevelId) throw new DomainException('La pregunta debe tener un nivel de dificultad.');
    if (!props.questionTypeId) throw new DomainException('La pregunta debe tener un tipo.');
    if (!props.text || !props.text.trim()) throw new DomainException('El texto de la pregunta es obligatorio.');

    return new Question({
      categoryId: props.categoryId,
      difficultyLevelId: props.difficultyLevelId,
      questionTypeId: props.questionTypeId,
      text: props.text.trim(),
      educationalExplanation: props.educationalExplanation?.trim() ?? null,
      status: QuestionStatus.Draft,
    });
  }

  static fromPersistence(props: {
    id: string;
    categoryId: string;
    difficultyLevelId: string;
    questionTypeId: string;
    text: string;
    educationalExplanation: string | null;
    status: QuestionStatus;
    answers: Answer[];
    createdAt: Date;
    updatedAt: Date | null;
  }): Question {
    return new Question(props);
  }

  get categoryId(): string {
    return this._categoryId;
  }
  get difficultyLevelId(): string {
    return this._difficultyLevelId;
  }
  get questionTypeId(): string {
    return this._questionTypeId;
  }
  get text(): string {
    return this._text;
  }
  get educationalExplanation(): string | null {
    return this._educationalExplanation;
  }
  get status(): QuestionStatus {
    return this._status;
  }
  get answers(): ReadonlyArray<Answer> {
    return this._answers;
  }

  addAnswer(text: string, isCorrect: boolean, order?: number): void {
    if (this._answers.length >= Question.MAX_ANSWERS) {
      throw new DomainException(`Una pregunta admite como máximo ${Question.MAX_ANSWERS} respuestas.`);
    }
    const effectiveOrder = order ?? this._answers.length;
    if (this._answers.some((a) => a.order === effectiveOrder)) {
      throw new DomainException('Ya existe una respuesta con ese orden.');
    }
    this._answers.push(Answer.createInternal(this.id, text, isCorrect, effectiveOrder));
    this.touch();
  }

  /** Valida que el agregado esté completo antes de poder ser seleccionado. */
  publish(): void {
    if (this._answers.length < Question.MIN_ANSWERS) {
      throw new DomainException(`Una pregunta requiere al menos ${Question.MIN_ANSWERS} respuestas para publicarse.`);
    }
    if (this._answers.length > Question.MAX_ANSWERS) {
      throw new DomainException(`Una pregunta admite como máximo ${Question.MAX_ANSWERS} respuestas.`);
    }
    if (!this._answers.some((a) => a.isCorrect)) {
      throw new DomainException('La pregunta debe tener al menos una respuesta correcta.');
    }
    this._status = QuestionStatus.Published;
    this.touch();
  }

  archive(): void {
    this._status = QuestionStatus.Archived;
    this.touch();
  }
}
