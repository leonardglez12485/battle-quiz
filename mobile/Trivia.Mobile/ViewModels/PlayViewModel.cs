using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Trivia.Mobile.Models;
using Trivia.Mobile.Services;

namespace Trivia.Mobile.ViewModels;

/// <summary>
/// Motor de una partida. Modo normal: pide las preguntas al backend
/// (api/game/start), envía cada respuesta para evaluación EN EL SERVIDOR
/// (api/game/answer: la app nunca conoce la respuesta correcta de antemano)
/// y cierra la partida con api/game/complete. Si el backend no responde,
/// cae a un modo demo offline con preguntas locales para poder recorrer la UI.
/// </summary>
public partial class PlayViewModel : BaseViewModel
{
    private const int SecondsPerQuestion = 20;

    private readonly IApiClient _api;
    private readonly List<QuizQuestion> _offlineQuestions = new();
    private List<GameQuestionDto> _questions = new();
    private string _sessionId = string.Empty;
    private bool _offline;

    private IDispatcherTimer? _timer;
    private int _index;
    private int _secondsLeft;
    private int _correctCount;
    private int _pointsEarned;
    private int _currentStreak;
    private int _bestStreak;
    private bool _answered;

    [ObservableProperty] private string questionText = string.Empty;
    [ObservableProperty] private string? explanation;
    [ObservableProperty] private bool isExplanationVisible;
    [ObservableProperty] private string progressLabel = string.Empty;
    [ObservableProperty] private double timeProgress = 1;
    [ObservableProperty] private string timeLabel = "0:20";
    [ObservableProperty] private bool canGoNext;
    [ObservableProperty] private bool isLoading;

    public ObservableCollection<AnswerOption> Options { get; } = new();

    public PlayViewModel(IApiClient api)
    {
        _api = api;
        Title = "Jugar";
    }

    public async void Start()
    {
        _index = 0;
        _correctCount = 0;
        _pointsEarned = 0;
        _currentStreak = 0;
        _bestStreak = 0;

        IsLoading = true;
        try
        {
            var res = await _api.PostAsync<StartGameRequest, StartGameResponse>(
                "api/game/start", new StartGameRequest("CLASSIC", TotalQuestions: 10));

            if (res is not null && res.Questions.Count > 0)
            {
                _offline = false;
                _sessionId = res.SessionId;
                _questions = res.Questions;
            }
            else
            {
                EnterOfflineMode();
            }
        }
        catch
        {
            EnterOfflineMode();
        }
        finally
        {
            IsLoading = false;
        }

        ShowCurrent();
    }

    private void EnterOfflineMode()
    {
        _offline = true;
        LoadPlaceholderQuestions();
        _questions = _offlineQuestions
            .Select(q => new GameQuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                Answers = q.Answers.Select((a, i) => new GameAnswerDto { Id = a.Id, Text = a.Text, Order = i }).ToList(),
            })
            .ToList();
    }

    private void ShowCurrent()
    {
        _answered = false;
        CanGoNext = false;
        IsExplanationVisible = false;
        Explanation = null;

        var q = _questions[_index];
        QuestionText = q.Text;
        ProgressLabel = $"Pregunta {_index + 1} de {_questions.Count}";

        Options.Clear();
        var letters = new[] { "A", "B", "C", "D", "E", "F" };
        var ordered = q.Answers.OrderBy(a => a.Order).ToList();
        for (var i = 0; i < ordered.Count; i++)
        {
            // La correcta NO viaja al cliente: se marca con la respuesta del servidor.
            var isCorrectLocal = _offline && IsOfflineCorrect(q.Id, ordered[i].Id);
            Options.Add(new AnswerOption(ordered[i].Id, letters[i], ordered[i].Text, isCorrectLocal));
        }

        StartTimer();
    }

    private bool IsOfflineCorrect(string questionId, string answerId) =>
        _offlineQuestions.FirstOrDefault(x => x.Id == questionId)?
            .Answers.FirstOrDefault(a => a.Id == answerId)?.IsCorrect ?? false;

    private void StartTimer()
    {
        _secondsLeft = SecondsPerQuestion;
        UpdateTime();

        _timer?.Stop();
        _timer = Application.Current!.Dispatcher.CreateTimer();
        _timer.Interval = TimeSpan.FromSeconds(1);
        _timer.Tick += (_, _) =>
        {
            _secondsLeft--;
            UpdateTime();
            if (_secondsLeft <= 0)
            {
                _timer?.Stop();
                if (!_answered) _ = HandleTimeoutAsync();
            }
        };
        _timer.Start();
    }

    private void UpdateTime()
    {
        TimeProgress = Math.Max(0, (double)_secondsLeft / SecondsPerQuestion);
        TimeLabel = $"0:{Math.Max(0, _secondsLeft):00}";
    }

    [RelayCommand]
    private async Task AnswerAsync(AnswerOption option)
    {
        if (_answered) return;
        _answered = true;
        _timer?.Stop();

        var timeTaken = SecondsPerQuestion - Math.Max(0, _secondsLeft);
        bool isCorrect;
        IReadOnlyCollection<string> correctIds;
        int points;

        if (_offline)
        {
            isCorrect = option.IsCorrect;
            correctIds = Options.Where(o => o.IsCorrect).Select(o => o.Id).ToList();
            points = isCorrect ? 20 : 0;
            Explanation = _offlineQuestions.FirstOrDefault(x => x.Id == _questions[_index].Id)?.Explanation;
        }
        else
        {
            try
            {
                var res = await _api.PostAsync<SubmitAnswerRequest, SubmitAnswerResponse>(
                    "api/game/answer",
                    new SubmitAnswerRequest(_sessionId, _questions[_index].Id, timeTaken, option.Id));

                isCorrect = res?.IsCorrect ?? false;
                correctIds = res?.CorrectAnswerIds ?? new List<string>();
                points = res?.PointsAwarded ?? 0;
                Explanation = res?.Explanation;
            }
            catch
            {
                // Si falla el envío, no bloquear la partida: marcar sin puntaje.
                isCorrect = false;
                correctIds = Array.Empty<string>();
                points = 0;
            }
        }

        foreach (var o in Options)
        {
            if (correctIds.Contains(o.Id)) o.State = AnswerState.Correct;
            else if (o == option && !isCorrect) o.State = AnswerState.Wrong;
            else o.State = AnswerState.Disabled;
        }

        if (isCorrect)
        {
            _correctCount++;
            _currentStreak++;
            _bestStreak = Math.Max(_bestStreak, _currentStreak);
            _pointsEarned += points;
        }
        else
        {
            _currentStreak = 0;
        }

        if (!string.IsNullOrWhiteSpace(Explanation))
            IsExplanationVisible = true;

        CanGoNext = true;
    }

    private async Task HandleTimeoutAsync()
    {
        // El tiempo agotado cuenta como respuesta incorrecta "sin selección".
        _answered = true;
        _currentStreak = 0;

        if (!_offline)
        {
            try
            {
                var res = await _api.PostAsync<SubmitAnswerRequest, SubmitAnswerResponse>(
                    "api/game/answer",
                    new SubmitAnswerRequest(_sessionId, _questions[_index].Id, SecondsPerQuestion));
                Explanation = res?.Explanation;
                foreach (var o in Options)
                    o.State = (res?.CorrectAnswerIds ?? new List<string>()).Contains(o.Id)
                        ? AnswerState.Correct
                        : AnswerState.Disabled;
            }
            catch
            {
                foreach (var o in Options) o.State = AnswerState.Disabled;
            }
        }
        else
        {
            Explanation = _offlineQuestions.FirstOrDefault(x => x.Id == _questions[_index].Id)?.Explanation;
            foreach (var o in Options)
                o.State = o.IsCorrect ? AnswerState.Correct : AnswerState.Disabled;
        }

        if (!string.IsNullOrWhiteSpace(Explanation))
            IsExplanationVisible = true;
        CanGoNext = true;
    }

    [RelayCommand]
    private async Task NextAsync()
    {
        if (!_answered) return;

        _index++;
        if (_index < _questions.Count)
        {
            ShowCurrent();
        }
        else
        {
            await FinishAsync();
        }
    }

    private async Task FinishAsync()
    {
        _timer?.Stop();
        var total = _questions.Count;

        if (!_offline)
        {
            try
            {
                var res = await _api.PostAsync<CompleteGameRequest, CompleteGameResponse>(
                    "api/game/complete", new CompleteGameRequest(_sessionId));

                if (res is not null)
                {
                    var route = $"result?correct={res.Correct}&total={res.Total}&xp={res.XpEarned}&coins={res.CoinsEarned}&streak={res.BestStreakInGame}";
                    await Shell.Current.GoToAsync(route);
                    return;
                }
            }
            catch
            {
                // cae al resumen local
            }
        }

        var xp = _correctCount * 30;
        await Shell.Current.GoToAsync(
            $"result?correct={_correctCount}&total={total}&xp={xp}&coins={_pointsEarned}&streak={_bestStreak}");
    }

    [RelayCommand]
    private async Task QuitAsync()
    {
        _timer?.Stop();
        await Shell.Current.GoToAsync("//home");
    }

    // ---- Comodines ----
    // 50/50 requiere conocer las incorrectas: solo funciona en modo offline.
    // Con el backend, será un endpoint (api/game/lifeline) en una etapa futura.
    [RelayCommand]
    private void FiftyFifty()
    {
        if (_answered || !_offline) return;
        var wrong = Options.Where(o => !o.IsCorrect).OrderBy(_ => Guid.NewGuid()).Take(2);
        foreach (var o in wrong) o.State = AnswerState.Disabled;
    }

    [RelayCommand]
    private void AddTime()
    {
        _secondsLeft += 10;
        UpdateTime();
    }

    [RelayCommand]
    private async Task SkipAsync()
    {
        if (!_answered)
        {
            await HandleTimeoutAsync();
        }
        await NextAsync();
    }

    private void LoadPlaceholderQuestions()
    {
        _offlineQuestions.Clear();
        _offlineQuestions.Add(new QuizQuestion
        {
            Id = "1",
            Category = "Deportes",
            Text = "¿Qué selección ganó el primer Mundial de fútbol?",
            Explanation = "El primer Mundial fue en 1930 y lo ganó Uruguay como anfitrión.",
            Answers = new List<QuizAnswer>
            {
                new("a", "Uruguay", true),
                new("b", "Brasil", false),
                new("c", "Italia", false),
                new("d", "Alemania", false),
            },
        });
        _offlineQuestions.Add(new QuizQuestion
        {
            Id = "2",
            Category = "Astronomía",
            Text = "¿Cuál es el planeta más grande del Sistema Solar?",
            Explanation = "Júpiter tiene más masa que todos los demás planetas juntos.",
            Answers = new List<QuizAnswer>
            {
                new("a", "La Tierra", false),
                new("b", "Júpiter", true),
                new("c", "Saturno", false),
                new("d", "Neptuno", false),
            },
        });
        _offlineQuestions.Add(new QuizQuestion
        {
            Id = "3",
            Category = "Historia",
            Text = "¿En qué año llegó el ser humano a la Luna por primera vez?",
            Explanation = "La misión Apolo 11 alunizó el 20 de julio de 1969.",
            Answers = new List<QuizAnswer>
            {
                new("a", "1969", true),
                new("b", "1972", false),
                new("c", "1965", false),
                new("d", "1958", false),
            },
        });
    }
}
