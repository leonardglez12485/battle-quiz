using System.Text.Json.Serialization;

namespace Trivia.Mobile.Models;

/// <summary>
/// Contratos de transporte con el backend NestJS (espejo de los DTOs de
/// backend/src/modules/*). Nombres en camelCase vía JsonPropertyName.
/// </summary>

// ---------- Auth ----------

public record RegisterRequest(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("password")] string Password,
    [property: JsonPropertyName("country")] string? Country = null);

public record LoginRequest(
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("password")] string Password);

public class AuthResponse
{
    [JsonPropertyName("token")] public string Token { get; set; } = string.Empty;
    [JsonPropertyName("user")] public AuthUser User { get; set; } = new();
}

public class AuthUser
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
    [JsonPropertyName("level")] public int Level { get; set; }
    [JsonPropertyName("xp")] public int Xp { get; set; }
    [JsonPropertyName("coins")] public int Coins { get; set; }
    [JsonPropertyName("avatarUrl")] public string? AvatarUrl { get; set; }
    [JsonPropertyName("country")] public string? Country { get; set; }
}

// ---------- Game ----------

public record StartGameRequest(
    [property: JsonPropertyName("mode")] string Mode,
    [property: JsonPropertyName("categoryIds")] IReadOnlyList<string>? CategoryIds = null,
    [property: JsonPropertyName("totalQuestions")] int? TotalQuestions = null);

public class StartGameResponse
{
    [JsonPropertyName("sessionId")] public string SessionId { get; set; } = string.Empty;
    [JsonPropertyName("questions")] public List<GameQuestionDto> Questions { get; set; } = new();
}

public class GameQuestionDto
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("text")] public string Text { get; set; } = string.Empty;
    [JsonPropertyName("categoryId")] public string CategoryId { get; set; } = string.Empty;
    [JsonPropertyName("questionTypeCode")] public string QuestionTypeCode { get; set; } = "multiple_choice";
    [JsonPropertyName("answers")] public List<GameAnswerDto> Answers { get; set; } = new();
}

public class GameAnswerDto
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("text")] public string Text { get; set; } = string.Empty;
    [JsonPropertyName("order")] public int Order { get; set; }
}

public record SubmitAnswerRequest(
    [property: JsonPropertyName("sessionId")] string SessionId,
    [property: JsonPropertyName("questionId")] string QuestionId,
    [property: JsonPropertyName("timeTakenSeconds")] int TimeTakenSeconds,
    [property: JsonPropertyName("selectedAnswerId")] string? SelectedAnswerId = null,
    [property: JsonPropertyName("writtenText")] string? WrittenText = null);

public class SubmitAnswerResponse
{
    [JsonPropertyName("isCorrect")] public bool IsCorrect { get; set; }
    [JsonPropertyName("correctAnswerIds")] public List<string> CorrectAnswerIds { get; set; } = new();
    [JsonPropertyName("explanation")] public string? Explanation { get; set; }
    [JsonPropertyName("pointsAwarded")] public int PointsAwarded { get; set; }
}

public record CompleteGameRequest(
    [property: JsonPropertyName("sessionId")] string SessionId);

public class CompleteGameResponse
{
    [JsonPropertyName("correct")] public int Correct { get; set; }
    [JsonPropertyName("total")] public int Total { get; set; }
    [JsonPropertyName("xpEarned")] public int XpEarned { get; set; }
    [JsonPropertyName("coinsEarned")] public int CoinsEarned { get; set; }
    [JsonPropertyName("pointsEarned")] public int PointsEarned { get; set; }
    [JsonPropertyName("bestStreakInGame")] public int BestStreakInGame { get; set; }
    [JsonPropertyName("newLevel")] public int NewLevel { get; set; }
    [JsonPropertyName("unlockedAchievements")] public List<UnlockedAchievementDto> UnlockedAchievements { get; set; } = new();
}

public class UnlockedAchievementDto
{
    [JsonPropertyName("code")] public string Code { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("description")] public string Description { get; set; } = string.Empty;
}

// ---------- Categorías / Perfil ----------

public class CategoryDto
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("iconUrl")] public string? IconUrl { get; set; }
}

public class ProfileResponse
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("level")] public int Level { get; set; }
    [JsonPropertyName("xp")] public int Xp { get; set; }
    [JsonPropertyName("xpForNextLevel")] public int XpForNextLevel { get; set; }
    [JsonPropertyName("coins")] public int Coins { get; set; }
    [JsonPropertyName("currentDailyStreak")] public int CurrentDailyStreak { get; set; }
}
