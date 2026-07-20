using Trivia.Mobile.ViewModels;

namespace Trivia.Mobile.Views;

public partial class ResultPage : ContentPage
{
    private readonly ResultViewModel _viewModel;

    public ResultPage(ResultViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        // Los query params (correct/total/xp/...) ya fueron aplicados por Shell.
        _viewModel.Evaluate();
    }
}
