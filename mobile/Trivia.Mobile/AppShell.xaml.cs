using Trivia.Mobile.Views;

namespace Trivia.Mobile;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();

        // Rutas de detalle (fuera del TabBar). Se navega con
        // Shell.Current.GoToAsync("login"), etc. A medida que se crean nuevas
        // páginas (play, result, profile...) se registran aquí.
        Routing.RegisterRoute("login", typeof(LoginPage));
        Routing.RegisterRoute("register", typeof(RegisterPage));
        Routing.RegisterRoute("play", typeof(PlayPage));
        Routing.RegisterRoute("result", typeof(ResultPage));
    }
}
