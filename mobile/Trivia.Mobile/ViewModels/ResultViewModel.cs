using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Trivia.Mobile.ViewModels;

/// <summary>
/// Resumen de una partida. Recibe los datos por parámetros de navegación
/// (Shell query properties, que llegan como texto) desde la pantalla Jugar.
/// La detección de logros desbloqueados llega desde el backend en la etapa de
/// endpoints; por ahora se muestra un ejemplo cuando el desempeño es alto.
/// </summary>
[QueryProperty(nameof(CorrectRaw), "correct")]
[QueryProperty(nameof(TotalRaw), "total")]
[QueryProperty(nameof(XpRaw), "xp")]
[QueryProperty(nameof(CoinsRaw), "coins")]
[QueryProperty(nameof(StreakRaw), "streak")]
public partial class ResultViewModel : BaseViewModel
{
    // Crudos (texto) que entrega Shell.
    public string CorrectRaw { get; set; } = "0";
    public string TotalRaw { get; set; } = "1";
    public string XpRaw { get; set; } = "0";
    public string CoinsRaw { get; set; } = "0";
    public string StreakRaw { get; set; } = "0";

    [ObservableProperty] private string scorePercentLabel = "0%";
    [ObservableProperty] private string scoreFractionLabel = "0 / 0";
    [ObservableProperty] private int xp;
    [ObservableProperty] private int coins;
    [ObservableProperty] private bool hasAchievement;
    [ObservableProperty] private string achievementName = string.Empty;
    [ObservableProperty] private string playerName = "Roxane Harley";

    public ResultViewModel()
    {
        Title = "Resultado";
    }

    /// <summary>Se llama desde la vista al aparecer, ya con los query params aplicados.</summary>
    public void Evaluate()
    {
        var correct = ParseInt(CorrectRaw);
        var total = Math.Max(1, ParseInt(TotalRaw));
        Xp = ParseInt(XpRaw);
        Coins = ParseInt(CoinsRaw);

        ScorePercentLabel = $"{Math.Round(correct * 100.0 / total)}%";
        ScoreFractionLabel = $"{correct} / {total}";

        if (correct == total)
        {
            HasAchievement = true;
            AchievementName = "Partida perfecta";
        }
        else if (correct >= 8)
        {
            HasAchievement = true;
            AchievementName = "Cien aciertos";
        }
        else
        {
            HasAchievement = false;
        }
    }

    private static int ParseInt(string value) => int.TryParse(value, out var n) ? n : 0;

    [RelayCommand]
    private async Task PlayAgainAsync()
    {
        await Shell.Current.GoToAsync("//home");
        await Shell.Current.GoToAsync("play");
    }

    [RelayCommand]
    private Task GoHomeAsync() => Shell.Current.GoToAsync("//home");
}
