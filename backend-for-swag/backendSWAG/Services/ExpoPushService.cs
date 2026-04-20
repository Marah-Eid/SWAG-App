using System.Text;
using System.Text.Json;

namespace SwagBackend.Services;

public interface IExpoPushService
{
    Task SendPushAsync(IEnumerable<string> expoTokens, string title, string body, object? data = null);
}

public class ExpoPushService : IExpoPushService
{
    private readonly HttpClient _http;
    private readonly ILogger<ExpoPushService> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public ExpoPushService(HttpClient http, ILogger<ExpoPushService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task SendPushAsync(IEnumerable<string> expoTokens, string title, string body, object? data = null)
    {
        var tokens = expoTokens.Where(t => t.StartsWith("ExponentPushToken[")).ToList();
        if (tokens.Count == 0) return;

        var messages = tokens.Select(token => new
        {
            to = token,
            sound = "default",
            title,
            body,
            data
        });

        var json = JsonSerializer.Serialize(messages, JsonOpts);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _http.PostAsync("https://exp.host/--/api/v2/push/send", content);
            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Expo push failed ({Status}): {Body}", response.StatusCode, responseBody);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Expo push notification");
        }
    }
}
