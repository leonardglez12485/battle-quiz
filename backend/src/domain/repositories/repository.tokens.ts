/**
 * Tokens de inyección para los contratos de repositorio. En NestJS, las
 * interfaces de TS desaparecen en runtime, así que usamos estos símbolos como
 * tokens de DI. Application depende de estos tokens (Dependency Inversion);
 * Infrastructure los provee con implementaciones Prisma.
 */
export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
export const DIFFICULTY_LEVEL_REPOSITORY = Symbol('DIFFICULTY_LEVEL_REPOSITORY');
export const QUESTION_TYPE_REPOSITORY = Symbol('QUESTION_TYPE_REPOSITORY');
export const QUESTION_REPOSITORY = Symbol('QUESTION_REPOSITORY');
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const ACHIEVEMENT_REPOSITORY = Symbol('ACHIEVEMENT_REPOSITORY');
export const USER_ACHIEVEMENT_REPOSITORY = Symbol('USER_ACHIEVEMENT_REPOSITORY');
export const GAME_SESSION_REPOSITORY = Symbol('GAME_SESSION_REPOSITORY');
export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');
