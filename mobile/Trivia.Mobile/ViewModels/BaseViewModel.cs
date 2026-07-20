using CommunityToolkit.Mvvm.ComponentModel;

namespace Trivia.Mobile.ViewModels;

/// <summary>
/// Base MVVM para todos los ViewModels (patrón CommunityToolkit.Mvvm:
/// ObservableObject + [ObservableProperty]/[RelayCommand] en las clases
/// derivadas). IsBusy/Title son de uso transversal en todas las pantallas.
/// Los ViewModels concretos (LoginViewModel, PlayViewModel, ...) se agregan
/// en la etapa de UI.
/// </summary>
public abstract partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string title = string.Empty;
}
