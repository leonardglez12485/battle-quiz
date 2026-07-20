namespace Trivia.Mobile.Models;

/// <summary>Ítem de categoría para la fila del Inicio. `Icon` es el nombre del SVG en Resources/Images.</summary>
public record CategoryItem(string Name, string Icon);

/// <summary>Ítem de modo de juego para las tarjetas "Más modos".</summary>
public record GameModeItem(string Name, string Subtitle, string Icon, string Plays);
