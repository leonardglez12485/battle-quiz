using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Trivia.Mobile.Services;

namespace Trivia.Mobile.ViewModels;

/// <summary>
/// Inicio de sesión. Valida entradas, llama al backend (en la etapa de
/// endpoints) y guarda el token en la sesión. Por ahora, con el backend sin
/// endpoints de auth, simula el login para poder navegar y ver el flujo.
/// </summary>
public partial class LoginViewModel : BaseViewModel
{
    private readonly IApiClient _api;
    private readonly ISessionService _session;

    [ObservableProperty]
    private string email = string.Empty;

    [ObservableProperty]
    private string password = string.Empty;

    [ObservableProperty]
    private bool isPasswordHidden = true;

    [ObservableProperty]
    private string? errorMessage;

    public LoginViewModel(IApiClient api, ISessionService session)
    {
        _api = api;
        _session = session;
        Title = "Ingresar";
    }

    [RelayCommand]
    private void TogglePasswordVisibility() => IsPasswordHidden = !IsPasswordHidden;

    [RelayCommand]
    private async Task SignInAsync()
    {
        ErrorMessage = null;

        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Completá tu email y contraseña.";
            return;
        }

        try
        {
            IsBusy = true;

            var res = await _api.PostAsync<Models.LoginRequest, Models.AuthResponse>(
                "api/auth/login", new Models.LoginRequest(Email, Password));

            if (res is null || string.IsNullOrEmpty(res.Token))
            {
                ErrorMessage = "Email o contraseña incorrectos.";
                return;
            }

            _api.AuthToken = res.Token;
            await _session.SignInAsync(res.Token);
            await Shell.Current.GoToAsync("//home");
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Email o contraseña incorrectos, o el servidor no responde.";
        }
        catch
        {
            ErrorMessage = "No pudimos iniciar sesión. Probá de nuevo.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private Task GoToRegisterAsync() => Shell.Current.GoToAsync("register");
}
