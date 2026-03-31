using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/chats")]
[Authorize]
public class ChatsController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ChatsController(SwagDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // GET /api/chats
    [HttpGet]
    public async Task<IActionResult> GetConversations()
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var convs = await _db.Conversations
            .Where(c =>
                (c.ParticipantOneId == myId && c.ParticipantOneType == myRole) ||
                (c.ParticipantTwoId == myId && c.ParticipantTwoType == myRole))
            .OrderByDescending(c => c.LastMessageTime ?? c.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationDto>();
        foreach (var conv in convs)
        {
            bool iAmP1 = conv.ParticipantOneId == myId && conv.ParticipantOneType == myRole;
            var otherId = iAmP1 ? conv.ParticipantTwoId : conv.ParticipantOneId;
            var otherType = iAmP1 ? conv.ParticipantTwoType : conv.ParticipantOneType;
            int unread = iAmP1 ? conv.P1Unread : conv.P2Unread;

            string otherName = "User";
            string? otherImage = null;

            if (otherType == UserRole.Customer)
            {
                var cust = await _db.Customers.FindAsync(otherId);
                otherName = cust?.FullName ?? otherName;
                otherImage = cust?.ProfileImage;
            }
            else if (otherType == UserRole.Vendor)
            {
                var v = await _db.Vendors.FindAsync(otherId);
                otherName = v?.ShopName ?? otherName;
                otherImage = v?.ProfileImage;
            }

            result.Add(new ConversationDto
            {
                Id = conv.Id,
                OtherParticipantId = otherId,
                OtherParticipantType = otherType.ToString().ToLower(),
                OtherParticipantName = otherName,
                OtherParticipantImage = otherImage,
                LastMessage = conv.LastMessage,
                LastMessageTime = conv.LastMessageTime,
                UnreadCount = unread,
                CreatedAt = conv.CreatedAt
            });
        }

        return Ok(result);
    }

    // POST /api/chats  (start or get conversation)
    [HttpPost]
    public async Task<IActionResult> StartConversation([FromBody] StartConversationRequest req)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        if (!Enum.TryParse<UserRole>(req.OtherUserType, true, out var otherRole))
            return BadRequest(new { message = "Invalid user type." });

        if (myId == req.OtherUserId && myRole == otherRole)
            return BadRequest(new { message = "Cannot start conversation with yourself." });

        // Look for existing conversation (both directions)
        var existing = await _db.Conversations.FirstOrDefaultAsync(c =>
            (c.ParticipantOneId == myId && c.ParticipantOneType == myRole &&
             c.ParticipantTwoId == req.OtherUserId && c.ParticipantTwoType == otherRole) ||
            (c.ParticipantOneId == req.OtherUserId && c.ParticipantOneType == otherRole &&
             c.ParticipantTwoId == myId && c.ParticipantTwoType == myRole));

        if (existing != null)
            return Ok(new { conversationId = existing.Id });

        var conv = new Conversation
        {
            ParticipantOneId = myId,
            ParticipantOneType = myRole,
            ParticipantTwoId = req.OtherUserId,
            ParticipantTwoType = otherRole
        };

        _db.Conversations.Add(conv);
        await _db.SaveChangesAsync();

        return Ok(new { conversationId = conv.Id });
    }

    // GET /api/chats/{conversationId}/messages
    [HttpGet("{conversationId:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid conversationId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var conv = await _db.Conversations.FindAsync(conversationId);
        if (conv == null) return NotFound();

        bool isParticipant =
            (conv.ParticipantOneId == myId && conv.ParticipantOneType == myRole) ||
            (conv.ParticipantTwoId == myId && conv.ParticipantTwoType == myRole);

        if (!isParticipant) return Forbid();

        var messages = await _db.ChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new ChatMessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                SenderType = m.SenderType.ToString().ToLower(),
                MessageText = m.MessageText,
                MessageType = m.MessageType.ToString().ToLower(),
                MediaUrl = m.MediaUrl,
                IsRead = m.IsRead,
                SentAt = m.SentAt,
                IsMine = m.SenderId == myId && m.SenderType == myRole
            })
            .ToListAsync();

        return Ok(messages.OrderBy(m => m.SentAt));
    }

    // POST /api/chats/{conversationId}/messages
    [HttpPost("{conversationId:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessageRequest req)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var conv = await _db.Conversations.FindAsync(conversationId);
        if (conv == null) return NotFound();

        bool isParticipant =
            (conv.ParticipantOneId == myId && conv.ParticipantOneType == myRole) ||
            (conv.ParticipantTwoId == myId && conv.ParticipantTwoType == myRole);

        if (!isParticipant) return Forbid();

        if (!Enum.TryParse<MessageType>(req.MessageType, true, out var msgType))
            msgType = MessageType.Text;

        if (msgType == MessageType.Text && string.IsNullOrWhiteSpace(req.MessageText))
            return BadRequest(new { message = "Message text is required for text messages." });

        var message = new ChatMessage
        {
            ConversationId = conversationId,
            SenderId = myId,
            SenderType = myRole,
            MessageText = req.MessageText?.Trim(),
            MessageType = msgType,
            MediaUrl = req.MediaUrl
        };

        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync();
        // Note: conversation unread counter is updated by DB trigger

        return Ok(new ChatMessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SenderType = message.SenderType.ToString().ToLower(),
            MessageText = message.MessageText,
            MessageType = message.MessageType.ToString().ToLower(),
            MediaUrl = message.MediaUrl,
            IsRead = message.IsRead,
            SentAt = message.SentAt,
            IsMine = true
        });
    }

    // PUT /api/chats/{conversationId}/read
    [HttpPut("{conversationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid conversationId)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var conv = await _db.Conversations.FindAsync(conversationId);
        if (conv == null) return NotFound();

        bool iAmP1 = conv.ParticipantOneId == myId && conv.ParticipantOneType == myRole;
        bool iAmP2 = conv.ParticipantTwoId == myId && conv.ParticipantTwoType == myRole;

        if (!iAmP1 && !iAmP2) return Forbid();

        // Reset unread counter
        if (iAmP1) conv.P1Unread = 0;
        else conv.P2Unread = 0;

        // Mark messages from the other participant as read
        var unreadMessages = await _db.ChatMessages
            .Where(m => m.ConversationId == conversationId && m.SenderId != myId && !m.IsRead)
            .ToListAsync();

        foreach (var msg in unreadMessages)
            msg.IsRead = true;

        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Messages marked as read." });
    }

    private static UserRole ParseRole(string role) => role switch
    {
        "Customer" => UserRole.Customer,
        "Vendor" => UserRole.Vendor,
        "Admin" => UserRole.Admin,
        _ => UserRole.Customer
    };
}
