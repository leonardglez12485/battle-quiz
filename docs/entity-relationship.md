# Modelo Entidad-Relación

Diagrama conceptual del modelo. La fuente de verdad ejecutable es
`backend/prisma/schema.prisma` (PostgreSQL / Neon), donde las tablas usan
snake_case (`categories`, `difficulty_levels`, `question_types`,
`questions`, `answers`, `users`, `user_statistics`, `achievements`,
`user_achievements`, `game_sessions`, `game_session_questions`). Los nombres
en el diagrama son los conceptuales.

```mermaid
erDiagram
    Categories ||--o{ Questions : clasifica
    DifficultyLevels ||--o{ Questions : nivel
    QuestionTypes ||--o{ Questions : tipo
    Questions ||--o{ Answers : tiene
    Users ||--|| UserStatistics : "1 a 1"
    Users ||--o{ UserAchievements : desbloquea
    Achievements ||--o{ UserAchievements : "es desbloqueado por"
    Users ||--o{ GameSessions : juega
    GameSessions ||--o{ GameSessionQuestions : contiene
    Questions ||--o{ GameSessionQuestions : "fue respondida en"
    Answers ||--o{ GameSessionQuestions : "fue seleccionada en"

    Categories {
        uuid Id PK
        string Name UK
        string Description
        bool IsActive
    }
    DifficultyLevels {
        uuid Id PK
        string Name
        int Score
        int Order UK
    }
    QuestionTypes {
        uuid Id PK
        string Code UK
        string Name
    }
    Questions {
        uuid Id PK
        uuid CategoryId FK
        uuid DifficultyLevelId FK
        uuid QuestionTypeId FK
        string Text
        string EducationalExplanation
        tinyint Status
    }
    Answers {
        uuid Id PK
        uuid QuestionId FK
        string Text
        bool IsCorrect
        int Order
    }
    Users {
        uuid Id PK
        string Name
        string Email UK
        string PasswordHash
        int Level
        int Xp
        int Coins
        int CurrentDailyStreak
        date LastPlayedDate
    }
    UserStatistics {
        uuid Id PK
        uuid UserId FK "UK"
        int QuestionsAnswered
        int CorrectAnswers
        int IncorrectAnswers
        float AverageResponseTimeSeconds
        int LongestStreak
        uuid FavoriteCategoryId FK
        uuid BestPerformingCategoryId FK
        uuid WorstPerformingCategoryId FK
    }
    Achievements {
        uuid Id PK
        string Code UK
        string Name
        tinyint CriteriaType
        int TargetValue
    }
    UserAchievements {
        uuid Id PK
        uuid UserId FK
        uuid AchievementId FK
        datetime UnlockedAtUtc
    }
    GameSessions {
        uuid Id PK
        uuid UserId FK
        tinyint Mode
        tinyint Status
        datetime StartedAtUtc
        datetime CompletedAtUtc
        int DurationSeconds
        int XpEarned
        int PointsEarned
    }
    GameSessionQuestions {
        uuid Id PK
        uuid GameSessionId FK
        uuid QuestionId FK
        uuid SelectedAnswerId FK
        bool IsCorrect
        int TimeTakenSeconds
        int PointsAwarded
        int Order
    }
```

Notas de normalización:
- Categorías / Dificultades / Tipos de pregunta están en tablas propias (3FN) — evita cualquier valor repetido/hardcodeado y permite CRUD futuro sin migración de esquema.
- `UserStatistics` es una extensión 1:1 de `Users` (no se fusiona en la misma tabla) para separar el dato "identidad/progresión" del dato "estadística calculada", que se reescribe con más frecuencia.
- `GameSessionQuestions` es la tabla de hechos (fact table) del historial: de aquí se derivan todos los reportes (aciertos por categoría, tiempo promedio, etc.) sin necesidad de duplicar información en `Questions`.
