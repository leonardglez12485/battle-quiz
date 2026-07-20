import { Inject, Injectable, Logger } from '@nestjs/common';
import { Question } from 'src/domain/entities/question.entity';
import {
  IQuestionRepository,
  IGameSessionRepository,
} from 'src/domain/repositories/repositories';
import {
  QUESTION_REPOSITORY,
  GAME_SESSION_REPOSITORY,
} from 'src/domain/repositories/repository.tokens';
import { QuestionSelectionCriteria } from './question-selection.types';

/**
 * Motor de selección inteligente de preguntas. Reglas cubiertas:
 *   1. Nunca repite una pregunta dentro de la misma partida.
 *   2. Evita preguntas respondidas recientemente por el usuario (ventana configurable).
 *   3. Prioriza preguntas nunca vistas (barajadas).
 *   4. Respeta la distribución de dificultad pedida (configurable).
 *   5. Respeta las categorías pedidas (configurable).
 *   6. Si una dificultad no tiene candidatas suficientes, redistribuye el
 *      déficit entre las demás dificultades con cupo y registra un warning.
 *
 * Pura orquestación: depende solo de contratos del dominio, no de Prisma.
 */
@Injectable()
export class QuestionSelectionEngine {
  private readonly logger = new Logger(QuestionSelectionEngine.name);

  constructor(
    @Inject(QUESTION_REPOSITORY) private readonly questions: IQuestionRepository,
    @Inject(GAME_SESSION_REPOSITORY) private readonly gameSessions: IGameSessionRepository,
  ) {}

  async select(criteria: QuestionSelectionCriteria): Promise<Question[]> {
    const entries = Object.entries(criteria.difficultyDistribution).filter(([, count]) => count > 0);
    if (entries.length === 0) {
      throw new Error('La distribución de dificultad debe especificar al menos una dificultad con cantidad > 0.');
    }

    const lookbackDays = criteria.recentQuestionsLookbackDays ?? 14;
    const recentlyAnswered = await this.gameSessions.recentlyAnsweredQuestionIds(criteria.userId, lookbackDays);
    const recentSet = new Set(recentlyAnswered);

    const selected: Question[] = [];
    const usedInThisSelection = new Set<string>();

    // Se procesan las dificultades por demanda descendente para que, ante un
    // déficit, las dificultades con más cupo absorban primero.
    const ordered = [...entries].sort((a, b) => b[1] - a[1]);

    for (const [difficultyLevelId, requestedCount] of ordered) {
      const excluded = [...usedInThisSelection, ...recentSet];
      const candidates = await this.questions.findCandidates({
        categoryIds: criteria.categoryIds,
        difficultyLevelId,
        excludedQuestionIds: excluded,
      });

      const chosen = this.pickShuffled(candidates, requestedCount);
      for (const q of chosen) {
        selected.push(q);
        usedInThisSelection.add(q.id);
      }

      const deficit = requestedCount - chosen.length;
      if (deficit > 0) {
        this.logger.warn(
          `Déficit de ${deficit} preguntas para la dificultad ${difficultyLevelId}. Se redistribuirá entre las demás dificultades.`,
        );
        await this.redistributeDeficit(deficit, difficultyLevelId, criteria, recentSet, usedInThisSelection, selected);
      }
    }

    // Barajado final entre dificultades para no mostrar bloques.
    return this.shuffle(selected);
  }

  private async redistributeDeficit(
    deficit: number,
    exhaustedDifficultyId: string,
    criteria: QuestionSelectionCriteria,
    recentSet: Set<string>,
    usedInThisSelection: Set<string>,
    selected: Question[],
  ): Promise<void> {
    const others = Object.keys(criteria.difficultyDistribution).filter((id) => id !== exhaustedDifficultyId);
    let remaining = deficit;

    for (const difficultyLevelId of others) {
      if (remaining <= 0) break;

      const excluded = [...usedInThisSelection, ...recentSet];
      const candidates = await this.questions.findCandidates({
        categoryIds: criteria.categoryIds,
        difficultyLevelId,
        excludedQuestionIds: excluded,
      });

      // De a 1 por vuelta para no vaciar una sola dificultad de golpe.
      const chosen = this.pickShuffled(candidates, Math.min(remaining, 1));
      for (const q of chosen) {
        selected.push(q);
        usedInThisSelection.add(q.id);
      }
      remaining -= chosen.length;
    }

    if (remaining > 0) {
      this.logger.warn(
        `No fue posible cubrir el déficit completo de la selección. Faltan ${remaining} preguntas. Revisar el banco de preguntas disponible.`,
      );
    }
  }

  private pickShuffled(candidates: Question[], count: number): Question[] {
    if (count <= 0 || candidates.length === 0) return [];
    return this.shuffle([...candidates]).slice(0, count);
  }

  private shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
}
