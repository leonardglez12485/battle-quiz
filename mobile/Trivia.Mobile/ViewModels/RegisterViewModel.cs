using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Trivia.Mobile.Services;

namespace Trivia.Mobile.ViewModels;

/// <summary>
/// Registro de un nuevo usuario. Misma estructura que Login; el POST real al
/// backend se cablea en la etapa de endpoints.
/// </summary>
public partial class RegisterViewModel : BaseViewModel
{
    private readonly IApiClient _api;
    private readonly ISessionService _session;

    [ObservableProperty]
    private string name = string.Empty;

    [ObservableProperty]
    private string email = string.Empty;

    [ObservableProperty]
    private string password = string.Empty;

    [ObservableProperty]
    private bool isPasswordHidden = true;

    [ObservableProperty]
    private string? errorMessage;

    public RegisterViewModel(IApiClient api, ISessionService session)
    {
        _api = api;
        _session = session;
        Title = "Crear cuenta";
    }

    [RelayCommand]
    private void TogglePasswordVisibility() => IsPasswordHidden = !IsPasswordHidden;

    [RelayCommand]
    private async Task RegisterAsync()
    {
        ErrorMessage = null;

        if (string.IsNullOrWhiteSpace(Name) || string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Completá todos los campos.";
            return;
        }
        if (Password.Length < 6)
        {
            ErrorMessage = "La contraseña debe tener al menos 6 caracteres.";
            return;
        }

        try
        {
            IsBusy = true;

            var res = await _api.PostAsync<Models.RegisterRequest, Models.AuthResponse>(
                "api/auth/register", new Models.RegisterRequest(Name, Email, Password));

            if (res is null || string.IsNullOrEmpty(res.Token))
            {
                ErrorMessage = "No pudimos crear la cuenta. Probá de nuevo.";
                return;
            }

            _api.AuthToken = res.Token;
            await _session.SignInAsync(res.Token);
            await Shell.Current.GoToAsync("//home");
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Ese email ya está registrado, o el servidor no responde.";
        }
        catch
        {
            ErrorMessage = "No pudimos crear la cuenta. Probá de nuevo.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private Task GoToLoginAsync() => Shell.Current.GoToAsync("..");
}
