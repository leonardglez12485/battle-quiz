using CommunityToolkit.Mvvm.ComponentModel;
using Microsoft.Maui.Graphics;
using Trivia.Mobile.Helpers;

namespace Trivia.Mobile.Models;

public enum AnswerState
{
    Default,
    Correct,
    Wrong,
    Disabled,
}

/// <summary>
/// Opción de respuesta (A/B/C/D) para la pantalla Jugar. Es observable: al
/// cambiar su estado, las propiedades de color se recalculan y la UI se
/// actualiza sin código en la vista. La verdad (`IsCorrect`) no se expone al
/// binding para no filtrarla antes de responder.
/// </summary>
public partial class AnswerOption : ObservableObject
{
    public string Id { get; }
    public string Letter { get; }
    public string Text { get; }
    public bool IsCorrect { get; }

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(BackgroundColor))]
    [NotifyPropertyChangedFor(nameof(StrokeColor))]
    [NotifyPropertyChangedFor(nameof(LetterBackground))]
    [NotifyPropertyChangedFor(nameof(LetterTextColor))]
    [NotifyPropertyChangedFor(nameof(ShowCheck))]
    [NotifyPropertyChangedFor(nameof(ShowRadio))]
    private AnswerState state = AnswerState.Default;

    public AnswerOption(string id, string letter, string text, bool isCorrect)
    {
        Id = id;
        Letter = letter;
        Text = text;
        IsCorrect = isCorrect;
    }

    public Color BackgroundColor => State switch
    {
        AnswerState.Correct => Color.FromArgb("#1F33D6A4"),
        AnswerState.Wrong => Color.FromArgb("#1FFF5C6C"),
        _ => AppColors.OptionBg,
    };

    public Color StrokeColor => State switch
    {
        AnswerState.Correct => AppColors.Success,
        AnswerState.Wrong => AppColors.Danger,
        _ => AppColors.Border,
    };

    public Color LetterBackground => State switch
    {
        AnswerState.Correct => AppColors.Success,
        AnswerState.Wrong => AppColors.Danger,
        _ => AppColors.SurfaceElevated,
    };

    public Color LetterTextColor => State switch
    {
        AnswerState.Correct => AppColors.SuccessDark,
        AnswerState.Wrong => Colors.White,
        _ => AppColors.PrimaryLight,
    };

    public bool ShowCheck => State == AnswerState.Correct;
    public bool ShowRadio => State == AnswerState.Default || State == AnswerState.Disabled;
}
