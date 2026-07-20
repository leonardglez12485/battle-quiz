import { PrismaClient, AchievementCriteriaType } from '@prisma/client';

/**
 * Seed de catálogos (Categorías, Dificultades, Tipos de pregunta, Logros).
 * Idempotente: usa upsert por clave natural, así se puede correr varias veces
 * sin duplicar. Las PREGUNTAS (contenido) se cargan aparte por scripts SQL
 * específicos — en v1 no hay panel de administración ni CRUD de preguntas.
 *
 * Ejecutar: `npm run prisma:seed` (o automáticamente tras `prisma migrate`).
 */
const prisma = new PrismaClient();

const CATEGORIES = [
  'Historia', 'Matemáticas', 'Geografía', 'Deportes', 'Tecnología',
  'Informática', 'Física', 'Química', 'Biología', 'Astronomía',
  'Literatura', 'Arte', 'Música', 'Cine', 'Videojuegos',
  'Gastronomía', 'Animales', 'Naturaleza', 'Cultura General',
];

const DIFFICULTIES = [
  { name: 'Muy Fácil', score: 5, order: 1 },
  { name: 'Fácil', score: 10, order: 2 },
  { name: 'Media', score: 20, order: 3 },
  { name: 'Difícil', score: 35, order: 4 },
  { name: 'Experto', score: 50, order: 5 },
];

const QUESTION_TYPES = [
  { code: 'multiple_choice', name: 'Opción múltiple' },
  { code: 'true_false', name: 'Verdadero/Falso' },
  { code: 'written', name: 'Respuesta escrita' },
  { code: 'fill_blank', name: 'Completar palabra' },
  { code: 'multi_select', name: 'Varias respuestas correctas' },
];

const ACHIEVEMENTS = [
  { code: 'first_correct_answer', name: 'Primer acierto', description: 'Responde tu primera pregunta correctamente.', criteriaType: AchievementCriteriaType.TOTAL_CORRECT_ANSWERS, targetValue: 1 },
  { code: 'correct_100', name: 'Cien aciertos', description: 'Responde 100 preguntas correctamente.', criteriaType: AchievementCriteriaType.TOTAL_CORRECT_ANSWERS, targetValue: 100 },
  { code: 'correct_500', name: 'Quinientos aciertos', description: 'Responde 500 preguntas correctamente.', criteriaType: AchievementCriteriaType.TOTAL_CORRECT_ANSWERS, targetValue: 500 },
  { code: 'correct_1000', name: 'Mil aciertos', description: 'Responde 1000 preguntas correctamente.', criteriaType: AchievementCriteriaType.TOTAL_CORRECT_ANSWERS, targetValue: 1000 },
  { code: 'level_10', name: 'Nivel 10', description: 'Alcanza el nivel 10.', criteriaType: AchievementCriteriaType.USER_LEVEL_REACHED, targetValue: 10 },
  { code: 'level_25', name: 'Nivel 25', description: 'Alcanza el nivel 25.', criteriaType: AchievementCriteriaType.USER_LEVEL_REACHED, targetValue: 25 },
  { code: 'level_50', name: 'Nivel 50', description: 'Alcanza el nivel 50.', criteriaType: AchievementCriteriaType.USER_LEVEL_REACHED, targetValue: 50 },
  { code: 'streak_7', name: 'Racha de 7 días', description: 'Juega 7 días seguidos.', criteriaType: AchievementCriteriaType.DAILY_STREAK_DAYS, targetValue: 7 },
  { code: 'streak_30', name: 'Racha de 30 días', description: 'Juega 30 días seguidos.', criteriaType: AchievementCriteriaType.DAILY_STREAK_DAYS, targetValue: 30 },
  { code: 'perfect_game', name: 'Partida perfecta', description: '100% de aciertos en una partida.', criteriaType: AchievementCriteriaType.PERFECT_GAME_PERCENTAGE, targetValue: 100 },
];

async function main(): Promise<void> {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const d of DIFFICULTIES) {
    await prisma.difficultyLevel.upsert({ where: { order: d.order }, update: { name: d.name, score: d.score }, create: d });
  }

  for (const t of QUESTION_TYPES) {
    await prisma.questionType.upsert({ where: { code: t.code }, update: { name: t.name }, create: t });
  }

  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { code: a.code }, update: {}, create: a });
  }

  console.log('Seed completado: categorías, dificultades, tipos de pregunta y logros.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
