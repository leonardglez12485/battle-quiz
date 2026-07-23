import { ArrayMaxSize, IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { GameMode } from 'src/domain/enums';

export class StartGameDto {
  @IsEnum(GameMode)
  mode!: GameMode;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  categoryIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  totalQuestions?: number;
}

export class SubmitAnswerDto {
  @IsUUID()
  sessionId!: string;

  @IsUUID()
  questionId!: string;

  @IsOptional()
  @IsUUID()
  selectedAnswerId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selectedAnswerIds?: string[];

  @IsOptional()
  @IsString()
  writtenText?: string;

  @IsInt()
  @Min(0)
  @Max(600)
  timeTakenSeconds!: number;
}

export class CompleteGameDto {
  @IsUUID()
  sessionId!: string;
}

export type LifelineType = 'fifty_fifty' | 'audience' | 'add_time';

export class LifelineDto {
  @IsUUID()
  sessionId!: string;

  @IsUUID()
  questionId!: string;

  @IsIn(['fifty_fifty', 'audience', 'add_time'])
  type!: LifelineType;
}

export interface AudienceVote {
  answerId: string;
  percent: number;
}

export interface LifelineResponse {
  // Para 50/50: ids de respuestas a ocultar (incorrectas).
  removeAnswerIds?: string[];
  // Para "Público": distribución de votos por respuesta (suma 100).
  audience?: AudienceVote[];
  // Segundos extra que otorga el comodín +Tiempo.
  addedSeconds?: number;
  // Costo que se cobró y saldo de monedas resultante.
  cost: number;
  coins: number;
}

// ---- Respuestas (las opciones NUNCA exponen isCorrect al iniciar) ----

export interface GameQuestionAnswerDto {
  id: string;
  text: string;
  order: number;
}

export interface GameQuestionDto {
  id: string;
  text: string;
  categoryId: string;
  difficultyLevelId: string;
  questionTypeCode: string;
  answers: GameQuestionAnswerDto[];
}

export interface StartGameResponse {
  sessionId: string;
  mode: GameMode;
  questions: GameQuestionDto[];
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswerIds: string[];
  explanation: string | null;
  pointsAwarded: number;
}

export interface UnlockedAchievementDto {
  code: string;
  name: string;
  description: string;
}

export interface CompleteGameResponse {
  correct: number;
  total: number;
  xpEarned: number;
  coinsEarned: number;
  pointsEarned: number;
  bestStreakInGame: number;
  levelsGained: number;
  newLevel: number;
  unlockedAchievements: UnlockedAchievementDto[];
}
