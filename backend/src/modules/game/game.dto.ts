import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
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
