namespace Trivia.Mobile.Models;

/// <summary>
/// Pregunta lista para jugar (proyección de UI). En la etapa de endpoints se
/// mapea desde la respuesta del backend (motor de selección de preguntas).
/// </summary>
public class QuizQuestion
{
    public required string Id { get; init; }
    public required string Category { get; init; }
    public required string Text { get; init; }
    public required string? Explanation { get; init; }
    public required IReadOnlyList<QuizAnswer> Answers { get; init; }
}

public record QuizAnswer(string Id, string Text, bool IsCorrect);
