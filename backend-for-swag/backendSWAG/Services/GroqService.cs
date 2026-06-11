using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace SwagBackend.Services;

public record GroqMessage(string Role, string Content);

public interface IGroqService
{
    Task<string?> ChatAsync(IEnumerable<GroqMessage> messages);
}

public class GroqService : IGroqService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly ILogger<GroqService> _logger;

    public GroqService(HttpClient http, IConfiguration config, ILogger<GroqService> logger)
    {
        _http = http;
        _apiKey = config["Groq:ApiKey"] ?? throw new InvalidOperationException("Groq:ApiKey not configured");
        _logger = logger;
    }

    public async Task<string?> ChatAsync(IEnumerable<GroqMessage> messages)
    {
        var body = JsonSerializer.Serialize(new
        {
            model = "llama-3.3-70b-versatile",
            messages = messages.Select(m => new { role = m.Role, content = m.Content }),
            max_tokens = 1024,
            temperature = 0.7
        });

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = new StringContent(body, Encoding.UTF8, "application/json");

        try
        {
            var response = await _http.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Groq API error {StatusCode}: {Body}", response.StatusCode, json);
                return null;
            }

            using var doc = JsonDocument.Parse(json);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq API call failed");
            return null;
        }
    }
}
