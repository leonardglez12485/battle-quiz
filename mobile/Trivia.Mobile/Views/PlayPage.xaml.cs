using Trivia.Mobile.ViewModels;

namespace Trivia.Mobile.Views;

public partial class PlayPage : ContentPage
{
    private readonly PlayViewModel _viewModel;

    public PlayPage(PlayViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _viewModel.Start();
    }
}
