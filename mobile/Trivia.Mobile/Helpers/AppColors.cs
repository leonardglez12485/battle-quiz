using Microsoft.Maui.Graphics;

namespace Trivia.Mobile.Helpers;

/// <summary>
/// Espejo en código de la paleta de Colors.xaml. Se usa cuando un color debe
/// asignarse desde el ViewModel (p. ej. el estado de una opción de respuesta),
/// donde no se puede referenciar un StaticResource del XAML.
/// Mantener sincronizado con Resources/Styles/Colors.xaml.
/// </summary>
public static class AppColors
{
    public static readonly Color BgDeep = Color.FromArgb("#0D0A16");
    public static readonly Color BgBase = Color.FromArgb("#160F26");
    public static readonly Color Surface = Color.FromArgb("#1E1836");
    public static readonly Color SurfaceAlt = Color.FromArgb("#241C42");
    public static readonly Color SurfaceElevated = Color.FromArgb("#2A2247");
    public static readonly Color OptionBg = Color.FromArgb("#1B1530");

    public static readonly Color Primary = Color.FromArgb("#7C5CFF");
    public static readonly Color PrimaryLight = Color.FromArgb("#B9A9F0");

    public static readonly Color Accent = Color.FromArgb("#FB6E2D");
    public static readonly Color AccentDark = Color.FromArgb("#2A0F02");

    public static readonly Color Success = Color.FromArgb("#33D6A4");
    public static readonly Color SuccessDark = Color.FromArgb("#06382A");
    public static readonly Color Danger = Color.FromArgb("#FF5C6C");
    public static readonly Color Warning = Color.FromArgb("#FFC24B");

    public static readonly Color TextPrimary = Color.FromArgb("#F1ECFB");
    public static readonly Color TextSecondary = Color.FromArgb("#A99FC4");
    public static readonly Color TextMuted = Color.FromArgb("#6C6288");

    public static readonly Color Border = Color.FromArgb("#2A2247");
}
