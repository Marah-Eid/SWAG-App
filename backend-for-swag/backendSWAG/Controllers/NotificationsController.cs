using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(SwagDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // GET /api/notifications
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 30)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var notifications = await _db.Notifications
            .Where(n => n.RecipientId == myId && n.RecipientType == myRole)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type.ToString().ToLower(),
                Title = n.Title,
                Body = n.Body,
                DeepLink = n.DeepLink,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        int unreadCount = await _db.Notifications
            .CountAsync(n => n.RecipientId == myId && n.RecipientType == myRole && !n.IsRead);

        return Ok(new { unreadCount, notifications });
    }

    // PUT /api/notifications/{id}/read
    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var notif = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.RecipientId == myId && n.RecipientType == myRole);

        if (notif == null) return NotFound();
        notif.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Marked as read." });
    }

    // PUT /api/notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var unread = await _db.Notifications
            .Where(n => n.RecipientId == myId && n.RecipientType == myRole && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
            n.IsRead = true;

        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = $"Marked {unread.Count} notifications as read." });
    }

    private static UserRole ParseRole(string role) => role switch
    {
        "Customer" => UserRole.Customer,
        "Vendor" => UserRole.Vendor,
        "Admin" => UserRole.Admin,
        _ => UserRole.Customer
    };
}
