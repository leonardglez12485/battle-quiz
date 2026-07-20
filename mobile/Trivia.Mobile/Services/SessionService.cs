namespace Trivia.Mobile.Services;

/// <summary>
/// Guarda la sesión del usuario (token JWT + datos básicos) de forma segura.
/// Usa SecureStorage de MAUI (Keychain en iOS / Keystore en Android). Las
/// pantallas consultan si hay sesión para decidir el arranque (Splash → Login
/// o Splash → Inicio).
/// </summary>
public interface ISessionService
{
    string? Token { get; }
    bool IsAuthenticated { get; }

    Task LoadAsync();
    Task SignInAsync(string token);
    Task SignOutAsync();
}

public class SessionService : ISessionService
{
    private const string TokenKey = "bq_token";

    public string? Token { get; private set; }
    public bool IsAuthenticated => !string.IsNullOrEmpty(Token);

    public async Task LoadAsync()
    {
        try
        {
            Token = await SecureStorage.Default.GetAsync(TokenKey);
        }
        catch
        {
            Token = null;
        }
    }

    public async Task SignInAsync(string token)
    {
        Token = token;
        await SecureStorage.Default.SetAsync(TokenKey, token);
    }

    public Task SignOutAsync()
    {
        Token = null;
        SecureStorage.Default.Remove(TokenKey);
        return Task.CompletedTask;
    }
}
