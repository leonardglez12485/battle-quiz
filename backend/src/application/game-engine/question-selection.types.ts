/**
 * Parámetros del motor de selección. Todo configurable: nada hardcodeado.
 * Un "20 preguntas: 5 muy fáciles, 5 fáciles, 5 medias, 3 difíciles, 2
 * experto" se expresa completamente en `difficultyDistribution`
 * (difficultyLevelId -> cantidad).
 */
export interface QuestionSelectionCriteria {
  userId: string;
  /** Categorías permitidas. Vacío = todas las categorías activas. */
  categoryIds: string[];
  /** difficultyLevelId -> cantidad de preguntas requeridas de ese nivel. */
  difficultyDistribution: Record<string, number>;
  /** Ventana (días) para considerar una pregunta "vista recientemente" y evitarla. */
  recentQuestionsLookbackDays?: number;
}

export const QUESTION_SELECTION_ENGINE = Symbol('QUESTION_SELECTION_ENGINE');
