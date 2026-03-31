using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwagBackend.Models;

[Table("conversations")]
public class Conversation
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("participant_one_id"), Required]
    public Guid ParticipantOneId { get; set; }

    [Column("participant_one_type")]
    public UserRole ParticipantOneType { get; set; }

    [Column("participant_two_id"), Required]
    public Guid ParticipantTwoId { get; set; }

    [Column("participant_two_type")]
    public UserRole ParticipantTwoType { get; set; }

    [Column("last_message")]
    public string? LastMessage { get; set; }

    [Column("last_message_time")]
    public DateTime? LastMessageTime { get; set; }

    [Column("p1_unread")]
    public int P1Unread { get; set; } = 0;

    [Column("p2_unread")]
    public int P2Unread { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

[Table("chat_messages")]
public class ChatMessage
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("conversation_id"), Required]
    public Guid ConversationId { get; set; }

    [Column("sender_id"), Required]
    public Guid SenderId { get; set; }

    [Column("sender_type")]
    public UserRole SenderType { get; set; }

    [Column("message_text")]
    public string? MessageText { get; set; }

    [Column("message_type")]
    public MessageType MessageType { get; set; } = MessageType.Text;

    [Column("media_url")]
    public string? MediaUrl { get; set; }

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("sent_at")]
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ConversationId")]
    public Conversation Conversation { get; set; } = null!;
}

[Table("notifications")]
public class Notification
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("recipient_id"), Required]
    public Guid RecipientId { get; set; }

    [Column("recipient_type")]
    public UserRole RecipientType { get; set; }

    [Column("type")]
    public NotificationType Type { get; set; }

    [Column("title"), MaxLength(200), Required]
    public string Title { get; set; } = string.Empty;

    [Column("body"), Required]
    public string Body { get; set; } = string.Empty;

    [Column("deep_link")]
    public string? DeepLink { get; set; }

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("vendor_approval_log")]
public class VendorApprovalLog
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("vendor_id"), Required]
    public Guid VendorId { get; set; }

    [Column("admin_id"), Required]
    public Guid AdminId { get; set; }

    [Column("action")]
    public VendorStatus Action { get; set; }

    [Column("actioned_at")]
    public DateTime ActionedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;

    [ForeignKey("AdminId")]
    public Admin Admin { get; set; } = null!;
}
