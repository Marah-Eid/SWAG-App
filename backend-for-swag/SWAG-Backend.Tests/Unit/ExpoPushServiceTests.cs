using Microsoft.Extensions.Logging;
using Moq;
using SwagBackend.Services;

namespace SWAG_Backend.Tests.Unit;

/// WT-05, WT-06: Expo push service tests
public class ExpoPushServiceTests
{
    [Fact]
    public async Task SendPushAsync_WithEmptyTokens_DoesNotCallApi()
    {
        // WT-06: Verify empty token list does not call Expo API
        var handler = new MockHttpMessageHandler(req =>
        {
            Assert.Fail("HTTP call should not have been made");
            return new HttpResponseMessage();
        });

        var httpClient = new HttpClient(handler);
        var logger = Mock.Of<ILogger<ExpoPushService>>();
        var service = new ExpoPushService(httpClient, logger);

        await service.SendPushAsync(Array.Empty<string>(), "Title", "Body");
    }

    [Fact]
    public async Task SendPushAsync_FiltersInvalidTokens()
    {
        // WT-05: Verify only valid ExponentPushToken format tokens are sent
        var tokens = new[]
        {
            "ExponentPushToken[valid1]",
            "invalid-token",
            "ExponentPushToken[valid2]",
            "random-string"
        };

        string? capturedBody = null;
        var handler = new MockHttpMessageHandler(async req =>
        {
            capturedBody = await req.Content!.ReadAsStringAsync();
            return new HttpResponseMessage(System.Net.HttpStatusCode.OK);
        });

        var httpClient = new HttpClient(handler);
        var logger = Mock.Of<ILogger<ExpoPushService>>();
        var service = new ExpoPushService(httpClient, logger);

        await service.SendPushAsync(tokens, "Title", "Body");

        Assert.NotNull(capturedBody);
        Assert.Contains("ExponentPushToken[valid1]", capturedBody);
        Assert.Contains("ExponentPushToken[valid2]", capturedBody);
        Assert.DoesNotContain("invalid-token", capturedBody);
    }

    private class MockHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, Task<HttpResponseMessage>> _handler;

        public MockHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
        {
            _handler = req => Task.FromResult(handler(req));
        }

        public MockHttpMessageHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> handler)
        {
            _handler = handler;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return _handler(request);
        }
    }
}
