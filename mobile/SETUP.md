# BattleQuiz — App móvil (.NET MAUI)

App de trivia en .NET MAUI (MVVM + Shell), modo oscuro premium (violeta de
marca + naranja de acción). Consume la API NestJS por HTTP.

## Requisitos

- .NET 9 SDK
- Workload de MAUI: `dotnet workload install maui`
- Para Android: Android SDK (viene con Visual Studio 2022 17.12+ o
  `dotnet workload install android`)
- Para iOS/Mac: Xcode (solo en macOS)

## Antes del primer build — agregar las fuentes

El proyecto usa OpenSans (estándar de la plantilla MAUI). Copiá estos dos
archivos a `Trivia.Mobile/Resources/Fonts/`:

- `OpenSans-Regular.ttf`
- `OpenSans-Semibold.ttf`

Se obtienen creando un proyecto MAUI de plantilla (`dotnet new maui`) y
copiando sus `Resources/Fonts/*.ttf`, o descargándolas de Google Fonts
(familia Open Sans). Sin estas fuentes el build falla al empaquetar recursos.

Los íconos NO necesitan fuente: son SVG en `Resources/Images/` que MAUI
rasteriza por plataforma en el build.

## Apuntar la app al backend

En `Services/ApiClient.cs`, `BaseUrl` define a qué backend pega la app:

- Producción (Render): `https://battlequiz-api.onrender.com`
- Backend local + emulador Android: `http://10.0.2.2:3000`
- Backend local + iOS simulator: `http://localhost:3000`

## Correr

```bash
cd mobile/Trivia.Mobile
dotnet build -t:Run -f net9.0-android      # o net9.0-ios
```

## Estructura

```
Trivia.Mobile/
├── Resources/
│   ├── Styles/Colors.xaml     Paleta (única fuente de verdad del color)
│   ├── Styles/Styles.xaml     Estilos de controles reutilizables
│   ├── Images/*.svg           Íconos y logo (line icons)
│   ├── AppIcon/               Ícono de la app
│   └── Splash/                Splash screen
├── Views/                     Páginas (Splash, Login, Register, Home)
├── ViewModels/                MVVM con CommunityToolkit.Mvvm
├── Services/                  ApiClient (HTTP) + SessionService (token seguro)
├── Models/                    Modelos de UI
├── Helpers/                   Convertidores de binding
├── AppShell.xaml              Navegación (Shell): Splash → Login/Registro → TabBar
└── MauiProgram.cs             Inyección de dependencias
```

## Estado (esta etapa)

Listo: sistema de diseño + navegación + pantallas Splash, Login, Registro e
Inicio, con datos de ejemplo para ver el diseño.

Pendiente (próximos pasos): pantallas Jugar, Resultado, Perfil, Ranking,
Logros, Categorías, Historial, Configuración; y cablear el login/registro y el
Inicio a los endpoints reales del backend (que también son etapa siguiente).

Como el login todavía no tiene endpoint, los botones Ingresar/Crear cuenta
simulan la sesión y entran al Inicio, para poder recorrer el flujo.
