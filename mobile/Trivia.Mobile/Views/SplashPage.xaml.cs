using Trivia.Mobile.Services;

namespace Trivia.Mobile.Views;

/// <summary>
/// Pantalla de arranque. Carga la sesión guardada, restaura el token en el
/// cliente HTTP y decide el destino: Inicio si hay sesión, Login si no.
/// </summary>
public partial class SplashPage : ContentPage
{
    private readonly ISessionService _session;
    private readonly IApiClient _api;

    public SplashPage(ISessionService session, IApiClient api)
    {
        InitializeComponent();
        _session = session;
        _api = api;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        await _session.LoadAsync();
        await Task.Delay(1200); // breve pausa de marca

        if (_session.IsAuthenticated)
        {
            _api.AuthToken = _session.Token;
            await Shell.Current.GoToAsync("//home");
        }
        else
        {
            await Shell.Current.GoToAsync("login");
        }
    }
}
