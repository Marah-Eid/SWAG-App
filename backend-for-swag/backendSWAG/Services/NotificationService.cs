using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Hubs;
using SwagBackend.Models;

namespace SwagBackend.Services;

public interface INotificationService
{
    Task SendAsync(Guid recipientId, UserRole recipientType, NotificationType type,
                   string title, string body, string? deepLink = null);
}

public class NotificationService : INotificationService
{
    private readonly SwagDbContext _db;
    private readonly IHubContext<NotificationHub> _hub;
    private readonly IExpoPushService _push;

    public NotificationService(SwagDbContext db, IHubContext<NotificationHub> hub, IExpoPushService push)
    {
        _db = db;
        _hub = hub;
        _push = push;
    }

    public async Task SendAsync(Guid recipientId, UserRole recipientType, NotificationType type,
                                string title, string body, string? deepLink = null)
    {
        var notification = new Notification
        {
            RecipientId = recipientId,
            RecipientType = recipientType,
            Type = type,
            Title = title,
            Body = body,
            DeepLink = deepLink
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        var dto = new NotificationDto
        {
            Id = notification.Id,
            Type = type.ToString().ToLower(),
            Title = title,
            Body = body,
            DeepLink = deepLink,
            IsRead = false,
            CreatedAt = notification.CreatedAt
        };

        // Real-time in-app via SignalR
        await _hub.Clients.Group(recipientId.ToString())
                  .SendAsync("ReceiveNotification", dto);

        // Push notification for when app is closed/background
        var tokens = await _db.DevicePushTokens
            .Where(d => d.UserId == recipientId && d.UserType == recipientType)
            .Select(d => d.ExpoToken)
            .ToListAsync();

        if (tokens.Count > 0)
        {
            await _push.SendPushAsync(tokens, title, body, new { deepLink, type = dto.Type });
        }
    }
}
