/**
 * Enums del dominio. Coinciden 1:1 con los enums del schema de Prisma para
 * que el mapeo entre persistencia y dominio sea directo. A diferencia de las
 * categorías / dificultades / tipos de pregunta (que son catálogos en BD y
 * NO enums), estos representan mecánicas fijas del producto.
 */

export enum QuestionStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Archived = 'ARCHIVED',
}

export enum GameMode {
  Classic = 'CLASSIC',
  Survival = 'SURVIVAL',
  TimeAttack = 'TIME_ATTACK',
  CategorySpecific = 'CATEGORY_SPECIFIC',
  DailyChallenge = 'DAILY_CHALLENGE',
}

export enum GameSessionStatus {
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Abandoned = 'ABANDONED',
}

export enum AchievementCriteriaType {
  TotalCorrectAnswers = 'TOTAL_CORRECT_ANSWERS',
  UserLevelReached = 'USER_LEVEL_REACHED',
  DailyStreakDays = 'DAILY_STREAK_DAYS',
  PerfectGamePercentage = 'PERFECT_GAME_PERCENTAGE',
}

/**
 * Códigos estables de tipos de pregunta. Referencia para el seed y para
 * resolver la estrategia de evaluación. No es una lista cerrada: agregar un
 * tipo = insertar una fila + crear una estrategia, sin tocar el dominio.
 */
export const QuestionTypeCodes = {
  MultipleChoice: 'multiple_choice',
  TrueFalse: 'true_false',
  Written: 'written',
  FillBlank: 'fill_blank',
  MultiSelect: 'multi_select',
} as const;
