import { Injectable } from '@nestjs/common';
import { Question } from 'src/domain/entities/question.entity';
import { QuestionTypeCodes } from 'src/domain/enums';

/** Lo que el cliente envía como respuesta, sin acoplarse a un tipo concreto. */
export interface AnswerSubmission {
  selectedAnswerId?: string | null;
  selectedAnswerIds?: string[] | null;
  writtenText?: string | null;
}

/**
 * Estrategia de evaluación por tipo de pregunta (Strategy Pattern). Cumple el
 * requisito "incorporar nuevos tipos sin modificar el dominio": agregar un
 * tipo = una clase nueva que implementa esta interfaz + registrarla en el
 * resolver. Domain y las estrategias existentes no se tocan (Open/Closed).
 */
export interface IAnswerEvaluationStrategy {
  readonly questionTypeCode: string;
  evaluate(question: Question, submission: AnswerSubmission): boolean;
}

export const ANSWER_EVALUATION_STRATEGIES = Symbol('ANSWER_EVALUATION_STRATEGIES');
export const ANSWER_EVALUATION_RESOLVER = Symbol('ANSWER_EVALUATION_RESOLVER');

const normalize = (text: string): string => text.trim().toLowerCase();

@Injectable()
export class MultipleChoiceStrategy implements IAnswerEvaluationStrategy {
  readonly questionTypeCode = QuestionTypeCodes.MultipleChoice;

  evaluate(question: Question, submission: AnswerSubmission): boolean {
    if (!submission.selectedAnswerId) return false;
    return question.answers.some((a) => a.id === submission.selectedAnswerId && a.isCorrect);
  }
}

@Injectable()
export class TrueFalseStrategy implements IAnswerEvaluationStrategy {
  readonly questionTypeCode = QuestionTypeCodes.TrueFalse;

  evaluate(question: Question, submission: AnswerSubmission): boolean {
    if (!submission.selectedAnswerId) return false;
    return question.answers.some((a) => a.id === submission.selectedAnswerId && a.isCorrect);
  }
}

@Injectable()
export class MultiSelectStrategy implements IAnswerEvaluationStrategy {
  readonly questionTypeCode = QuestionTypeCodes.MultiSelect;

  evaluate(question: Question, submission: AnswerSubmission): boolean {
    if (!submission.selectedAnswerIds || submission.selectedAnswerIds.length === 0) return false;

    const correct = new Set(question.answers.filter((a) => a.isCorrect).map((a) => a.id));
    const selected = new Set(submission.selectedAnswerIds);

    // Correcto solo si el conjunto coincide exactamente con las correctas.
    if (correct.size !== selected.size) return false;
    for (const id of correct) if (!selected.has(id)) return false;
    return true;
  }
}

@Injectable()
export class WrittenStrategy implements IAnswerEvaluationStrategy {
  readonly questionTypeCode = QuestionTypeCodes.Written;

  evaluate(question: Question, submission: AnswerSubmission): boolean {
    if (!submission.writtenText || !submission.writtenText.trim()) return false;
    const input = normalize(submission.writtenText);
    return question.answers.filter((a) => a.isCorrect).some((a) => normalize(a.text) === input);
  }
}

@Injectable()
export class FillBlankStrategy implements IAnswerEvaluationStrategy {
  readonly questionTypeCode = QuestionTypeCodes.FillBlank;

  evaluate(question: Question, submission: AnswerSubmission): boolean {
    if (!submission.writtenText || !submission.writtenText.trim()) return false;
    const input = normalize(submission.writtenText);
    return question.answers.filter((a) => a.isCorrect).some((a) => normalize(a.text) === input);
  }
}

/**
 * Resuelve la estrategia por código de tipo de pregunta. Recibe todas las
 * estrategias registradas (inyectadas como array) y las indexa por su código.
 */
@Injectable()
export class AnswerEvaluationResolver {
  private readonly map = new Map<string, IAnswerEvaluationStrategy>();

  constructor(strategies: IAnswerEvaluationStrategy[]) {
    for (const s of strategies) this.map.set(s.questionTypeCode, s);
  }

  resolve(questionTypeCode: string): IAnswerEvaluationStrategy {
    const strategy = this.map.get(questionTypeCode);
    if (!strategy) {
      throw new Error(`No hay una estrategia de evaluación registrada para el tipo de pregunta '${questionTypeCode}'.`);
    }
    return strategy;
  }
}
