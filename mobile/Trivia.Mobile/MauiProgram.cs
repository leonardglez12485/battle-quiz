using CommunityToolkit.Mvvm.Messaging;
using Microsoft.Extensions.Logging;
using Trivia.Mobile.Services;
using Trivia.Mobile.ViewModels;
using Trivia.Mobile.Views;

namespace Trivia.Mobile;

/// <summary>
/// Composición de la app: fuentes, servicios (cliente HTTP hacia la API),
/// ViewModels y Views. Todo por inyección de dependencias; las páginas
/// reciben su ViewModel por constructor.
/// </summary>
public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

#if DEBUG
        builder.Logging.AddDebug();
#endif

        // ---- Infraestructura de cliente ----
        // BaseAddress se ajusta al backend NestJS (local o Render).
        builder.Services.AddSingleton<IApiClient, ApiClient>();
        builder.Services.AddSingleton<ISessionService, SessionService>();
        builder.Services.AddSingleton<IMessenger>(WeakReferenceMessenger.Default);

        // ---- ViewModels ----
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<RegisterViewModel>();
        builder.Services.AddTransient<HomeViewModel>();
        builder.Services.AddTransient<PlayViewModel>();
        builder.Services.AddTransient<ResultViewModel>();

        // ---- Views ----
        builder.Services.AddTransient<SplashPage>();
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<RegisterPage>();
        builder.Services.AddTransient<HomePage>();
        builder.Services.AddTransient<PlayPage>();
        builder.Services.AddTransient<ResultPage>();

        return builder.Build();
    }
}
