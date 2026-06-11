using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwagBackend.Models;

[Table("assistant_conversations")]
public class AssistantConversation
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("customer_id"), Required]
    public Guid CustomerId { get; set; }

    [Column("vin"), MaxLength(17)]
    public string? Vin { get; set; }

    [Column("vehicle_info_json")]
    public string? VehicleInfoJson { get; set; }

    [Column("title"), MaxLength(150)]
    public string Title { get; set; } = "New Chat";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

    public ICollection<AssistantMessage> Messages { get; set; } = new List<AssistantMessage>();
}

[Table("assistant_messages")]
public class AssistantMessage
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("conversation_id"), Required]
    public Guid ConversationId { get; set; }

    [Column("role"), MaxLength(20), Required]
    public string Role { get; set; } = "user";

    [Column("content"), Required]
    public string Content { get; set; } = string.Empty;

    [Column("sent_at")]
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ConversationId")]
    public AssistantConversation Conversation { get; set; } = null!;
}
