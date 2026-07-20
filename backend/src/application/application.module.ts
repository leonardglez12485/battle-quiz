import { Module } from '@nestjs/common';
import { QuestionSelectionEngine } from './game-engine/question-selection.engine';
import { QUESTION_SELECTION_ENGINE } from './game-engine/question-selection.types';
import {
  AnswerEvaluationResolver,
  ANSWER_EVALUATION_RESOLVER,
  FillBlankStrategy,
  IAnswerEvaluationStrategy,
  MultiSelectStrategy,
  MultipleChoiceStrategy,
  TrueFalseStrategy,
  WrittenStrategy,
} from './evaluation/answer-evaluation';

/**
 * Registra toda la lógica de aplicación: el motor de selección de preguntas y
 * las estrategias de evaluación con su resolver.
 *
 * Extensibilidad (Open/Closed): agregar un tipo de pregunta nuevo = crear la
 * estrategia + añadirla al array de `inject` del resolver. Nada más cambia.
 * Los Casos de Uso concretos (Auth, Game, Users, ...) se registran aquí en la
 * próxima etapa, manteniendo este módulo como único punto de verdad de
 * "qué expone Application".
 */
@Module({
  providers: [
    { provide: QUESTION_SELECTION_ENGINE, useClass: QuestionSelectionEngine },

    MultipleChoiceStrategy,
    TrueFalseStrategy,
    MultiSelectStrategy,
    WrittenStrategy,
    FillBlankStrategy,
    {
      provide: ANSWER_EVALUATION_RESOLVER,
      useFactory: (...strategies: IAnswerEvaluationStrategy[]) => new AnswerEvaluationResolver(strategies),
      inject: [MultipleChoiceStrategy, TrueFalseStrategy, MultiSelectStrategy, WrittenStrategy, FillBlankStrategy],
    },
  ],
  exports: [QUESTION_SELECTION_ENGINE, ANSWER_EVALUATION_RESOLVER],
})
export class ApplicationModule {}
