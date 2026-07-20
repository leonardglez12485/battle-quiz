using System.Net.Http.Json;

namespace Trivia.Mobile.Services;

/// <summary>
/// Cliente HTTP hacia el backend NestJS. Es la ÚNICA puerta de la app hacia
/// la red: las pantallas hablan con este contrato, nunca con HttpClient
/// directamente. En etapas siguientes se agregan los métodos por feature
/// (login, register, home, play, ...).
/// </summary>
public interface IApiClient
{
    string BaseUrl { get; set; }
    string? AuthToken { get; set; }

    Task<TResponse?> GetAsync<TResponse>(string path, CancellationToken ct = default);
    Task<TResponse?> PostAsync<TRequest, TResponse>(string path, TRequest body, CancellationToken ct = default);
}

public class ApiClient : IApiClient
{
    private readonly HttpClient _http;

    // Ajustar al desplegar: en Android emulador el localhost del host es
    // 10.0.2.2; en producción, la URL de Render (https://battlequiz-api.onrender.com).
    public string BaseUrl { get; set; } = "https://battlequiz-api.onrender.com";
    public string? AuthToken { get; set; }

    public ApiClient()
    {
        _http = new HttpClient();
    }

    public async Task<TResponse?> GetAsync<TResponse>(string path, CancellationToken ct = default)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, Combine(path));
        Authorize(req);
        var res = await _http.SendAsync(req, ct);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<TResponse>(cancellationToken: ct);
    }

    public async Task<TResponse?> PostAsync<TRequest, TResponse>(string path, TRequest body, CancellationToken ct = default)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, Combine(path))
        {
            Content = JsonContent.Create(body),
        };
        Authorize(req);
        var res = await _http.SendAsync(req, ct);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<TResponse>(cancellationToken: ct);
    }

    private string Combine(string path) => $"{BaseUrl.TrimEnd('/')}/{path.TrimStart('/')}";

    private void Authorize(HttpRequestMessage req)
    {
        if (!string.IsNullOrEmpty(AuthToken))
        {
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", AuthToken);
        }
    }
}
