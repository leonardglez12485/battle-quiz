# BattleQuiz — Backend (NestJS + Prisma + PostgreSQL/Neon)

API de trivia. Clean Architecture sobre NestJS, ORM Prisma, base de datos
PostgreSQL en Neon, pensada para desplegar en Render.

## Capas (Clean Architecture / SOLID)

```
src/
├── domain/          Entidades, agregados, enums, excepciones, CONTRATOS de repositorio.
│                    Cero dependencias a Prisma o NestJS. Puro TypeScript.
├── application/     Casos de uso, motor de selección de preguntas, estrategias
│                    de evaluación. Depende solo de contratos del dominio.
├── infrastructure/  Prisma (DbContext, repositorios, mappers, Unit of Work),
│                    JWT/bcrypt, filtro de errores HTTP. Implementa los contratos.
└── modules/         Controladores (presentación). Delgados, sin lógica de negocio.
```

La regla de dependencia apunta siempre hacia el dominio (Dependency Inversion):
Infrastructure implementa interfaces definidas en Domain; los casos de uso
inyectan tokens (`repository.tokens.ts`), nunca Prisma directamente. Cambiar
Prisma/Postgres por otra cosa no toca Domain ni Application.

## Decisiones clave

- **Catálogos en BD, no enums**: Category, DifficultyLevel y QuestionType son
  tablas. Agregar una categoría o dificultad = una fila, sin redeploy.
- **Tipos de pregunta extensibles**: el "cómo se evalúa" cada tipo vive en
  `application/evaluation` como estrategias resueltas por código. Agregar un
  tipo nuevo = una clase + registrarla. El dominio no se toca (Open/Closed).
- **Agregados con invariantes**: `Question` (2–6 respuestas, ≥1 correcta),
  `User` (progresión de XP/nivel/racha), `GameSession` (no repetir pregunta,
  estado terminal). El estado sólo cambia por métodos del agregado.
- **Unit of Work**: operaciones que tocan varios agregados (completar una
  partida) se confirman en una sola transacción vía `prisma.$transaction`.
- **Motor de selección**: `application/game-engine`, totalmente configurable
  (cantidad, distribución de dificultad, categorías, ventana de "visto
  recientemente"). Nada hardcodeado.

## Requisitos

- Node 20+ (probado en Node 22)
- Una base de datos PostgreSQL en Neon (https://neon.tech)

## Puesta en marcha (local)

```bash
cp .env.example .env       # completar DATABASE_URL, DIRECT_URL y JWT_SECRET (Neon)
npm install                # instala deps y corre `prisma generate`
npm run prisma:migrate     # crea las tablas (migración inicial) en Neon
npm run prisma:seed        # carga categorías, dificultades, tipos y logros
npm run start:dev          # API en http://localhost:3000, Swagger en /docs
```

Health check: `GET /health` → `{ "status": "ok", "database": "up" }`.

## Endpoints (v1)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Crea cuenta, devuelve JWT + perfil básico |
| POST | `/api/auth/login` | — | Inicia sesión, devuelve JWT + perfil básico |
| GET | `/api/categories` | — | Categorías activas |
| POST | `/api/game/start` | JWT | Inicia partida: aplica el motor de selección y devuelve preguntas (sin marcar la correcta) |
| POST | `/api/game/answer` | JWT | Evalúa la respuesta en el servidor (estrategia por tipo), devuelve veredicto + explicación |
| POST | `/api/game/complete` | JWT | Cierra la partida en una transacción: XP, monedas, estadísticas, racha diaria y logros |
| GET | `/api/users/me` | JWT | Perfil + estadísticas |
| GET | `/api/users/ranking` | JWT | Top de jugadores por nivel/XP |
| GET | `/api/users/me/history` | JWT | Historial de partidas (paginado) |
| GET | `/api/users/me/achievements` | JWT | Todos los logros con estado de desbloqueo |
| GET | `/health` | — | Salud de la app y la base |

Notas de seguridad de juego: la respuesta correcta nunca viaja al cliente al
iniciar la partida; la evaluación ocurre en el servidor. Los puntos salen de la
puntuación del nivel de dificultad (catálogo en BD), XP = puntos y las monedas
se derivan de los puntos.

## Pruebas

```bash
npm test
```

Invariantes de `Question` y `User`, estrategias de evaluación y evaluador de
logros. Verificado: 15/15 en verde.

## Notas sobre Prisma en entornos sin salida a binaries.prisma.sh

`prisma generate` descarga los engines de Prisma. Si tu entorno de CI bloquea
`binaries.prisma.sh`, el build fallará. Render sí tiene acceso, así que el
deploy funciona. En local basta con tener salida a internet estándar.
