import { Question } from 'src/domain/entities/question.entity';
import { QuestionStatus } from 'src/domain/enums';
import { DomainException } from 'src/domain/exceptions/domain.exception';
import { randomUUID } from 'crypto';

const createValidQuestion = (): Question =>
  Question.create({
    categoryId: randomUUID(),
    difficultyLevelId: randomUUID(),
    questionTypeId: randomUUID(),
    text: '¿Cuál es el planeta más grande?',
    educationalExplanation: 'Júpiter tiene más masa que todos los demás planetas juntos.',
  });

describe('Question (aggregate)', () => {
  it('no permite publicar con menos de 2 respuestas', () => {
    const q = createValidQuestion();
    q.addAnswer('Júpiter', true);
    expect(() => q.publish()).toThrow(DomainException);
  });

  it('no permite publicar si ninguna respuesta es correcta', () => {
    const q = createValidQuestion();
    q.addAnswer('Júpiter', false);
    q.addAnswer('Marte', false);
    expect(() => q.publish()).toThrow(/al menos una respuesta correcta/);
  });

  it('no permite más de 6 respuestas', () => {
    const q = createValidQuestion();
    for (let i = 0; i < 6; i++) q.addAnswer(`Opción ${i}`, i === 0);
    expect(() => q.addAnswer('Séptima', false)).toThrow(/máximo 6/);
  });

  it('publica correctamente con 2-6 respuestas y al menos una correcta', () => {
    const q = createValidQuestion();
    q.addAnswer('Júpiter', true);
    q.addAnswer('Saturno', false);
    q.publish();
    expect(q.status).toBe(QuestionStatus.Published);
  });
});
