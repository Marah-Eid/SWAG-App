namespace SwagBackend.DTOs;

public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid OtherParticipantId { get; set; }
    public string OtherParticipantType { get; set; } = string.Empty;
    public string OtherParticipantName { get; set; } = string.Empty;
    public string? OtherParticipantImage { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? OtherParticipantLastSeen { get; set; }
}

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderType { get; set; } = string.Empty;
    public string? MessageText { get; set; }
    public string MessageType { get; set; } = "text";
    public string? MediaUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsMine { get; set; }
}

public class StartConversationRequest
{
    public Guid OtherUserId { get; set; }
    public string OtherUserType { get; set; } = string.Empty; // Customer | Vendor
}

public class SendMessageRequest
{
    public string? MessageText { get; set; }
    public string MessageType { get; set; } = "text"; // text | image | video
    public string? MediaUrl { get; set; }
}

public class UserSearchResultDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public string UserType { get; set; } = string.Empty; // "Customer" or "Vendor"
}
