import { Question } from 'src/domain/entities/question.entity';
import {
  AnswerEvaluationResolver,
  MultiSelectStrategy,
  MultipleChoiceStrategy,
} from 'src/application/evaluation/answer-evaluation';
import { randomUUID } from 'crypto';

const buildQuestion = (): Question => {
  const q = Question.create({
    categoryId: randomUUID(),
    difficultyLevelId: randomUUID(),
    questionTypeId: randomUUID(),
    text: '¿Cuáles son primos?',
  });
  q.addAnswer('2', true);
  q.addAnswer('3', true);
  q.addAnswer('4', false);
  return q;
};

describe('Estrategias de evaluación', () => {
  it('multi_select es correcto solo si coincide exactamente el conjunto de correctas', () => {
    const q = buildQuestion();
    const correctIds = q.answers.filter((a) => a.isCorrect).map((a) => a.id);
    const strategy = new MultiSelectStrategy();
    expect(strategy.evaluate(q, { selectedAnswerIds: correctIds })).toBe(true);
  });

  it('multi_select falla si falta una respuesta correcta', () => {
    const q = buildQuestion();
    const partial = q.answers.filter((a) => a.isCorrect).slice(0, 1).map((a) => a.id);
    const strategy = new MultiSelectStrategy();
    expect(strategy.evaluate(q, { selectedAnswerIds: partial })).toBe(false);
  });

  it('el resolver lanza error para un código no registrado', () => {
    const resolver = new AnswerEvaluationResolver([new MultipleChoiceStrategy()]);
    expect(() => resolver.resolve('codigo_inexistente')).toThrow();
  });
});
