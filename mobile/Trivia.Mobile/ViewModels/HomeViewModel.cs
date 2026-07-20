using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Trivia.Mobile.Models;
using Trivia.Mobile.Services;

namespace Trivia.Mobile.ViewModels;

/// <summary>
/// Pantalla de Inicio. Expone los datos del jugador y las colecciones que
/// pintan la UI. Hoy se cargan con datos de ejemplo para ver el diseño; en la
/// etapa de endpoints, LoadAsync llamará a la API (perfil + categorías).
/// </summary>
public partial class HomeViewModel : BaseViewModel
{
    private readonly IApiClient _api;

    [ObservableProperty]
    private string userName = "Roxane Harley";

    [ObservableProperty]
    private string userLevelLabel = "Experto";

    [ObservableProperty]
    private string userInitials = "RH";

    [ObservableProperty]
    private int coins = 1200;

    [ObservableProperty]
    private string dailyTaskProgressLabel = "9/14";

    [ObservableProperty]
    private double dailyTaskProgress = 0.64;

    public ObservableCollection<CategoryItem> Categories { get; } = new();
    public ObservableCollection<GameModeItem> GameModes { get; } = new();

    public HomeViewModel(IApiClient api)
    {
        _api = api;
        Title = "Inicio";
        LoadPlaceholder();
    }

    /// <summary>
    /// Carga el perfil real y las categorías del backend (con fallback a los
    /// datos de ejemplo si no hay conexión). La llama la vista al aparecer.
    /// </summary>
    public async Task RefreshAsync()
    {
        try
        {
            var profile = await _api.GetAsync<ProfileResponse>("api/users/me");
            if (profile is not null)
            {
                UserName = profile.Name;
                UserInitials = BuildInitials(profile.Name);
                UserLevelLabel = $"Nivel {profile.Level}";
                Coins = profile.Coins;
            }

            var categories = await _api.GetAsync<List<CategoryDto>>("api/categories");
            if (categories is { Count: > 0 })
            {
                Categories.Clear();
                foreach (var c in categories)
                    Categories.Add(new CategoryItem(c.Name, MapCategoryIcon(c.Name)));
            }
        }
        catch
        {
            // Sin conexión: se mantienen los datos de ejemplo.
        }
    }

    private static string BuildInitials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length >= 2
            ? $"{char.ToUpper(parts[0][0])}{char.ToUpper(parts[1][0])}"
            : name.Length > 0 ? char.ToUpper(name[0]).ToString() : "?";
    }

    /// <summary>Asigna un ícono local según el nombre de la categoría (hasta tener iconUrl remotos).</summary>
    private static string MapCategoryIcon(string name) => name.ToLowerInvariant() switch
    {
        "deportes" => "icon_football.png",
        "historia" => "icon_swords.png",
        "cine" => "icon_movie.png",
        "música" or "musica" => "icon_music.png",
        "arte" => "icon_palette.png",
        "física" or "química" or "ciencia" or "biología" => "icon_flask.png",
        "geografía" => "icon_compass.png",
        _ => "icon_flask.png",
    };

    private void LoadPlaceholder()
    {
        Categories.Clear();
        Categories.Add(new CategoryItem("Deportes", "icon_football.png"));
        Categories.Add(new CategoryItem("Ciencia", "icon_flask.png"));
        Categories.Add(new CategoryItem("Arte", "icon_palette.png"));
        Categories.Add(new CategoryItem("Cine", "icon_movie.png"));
        Categories.Add(new CategoryItem("Música", "icon_music.png"));

        GameModes.Clear();
        GameModes.Add(new GameModeItem("Clásico", "10 preguntas", "icon_swords.png", "24,7K"));
        GameModes.Add(new GameModeItem("Supervivencia", "Hasta fallar", "icon_compass.png", "12,5K"));
    }

    [RelayCommand]
    private Task PlayAsync() => Shell.Current.GoToAsync("play");

    [RelayCommand]
    private Task OpenCategoryAsync(CategoryItem category) =>
        Shell.Current.DisplayAlert(category.Name, "Categoría seleccionada.", "OK");
}
