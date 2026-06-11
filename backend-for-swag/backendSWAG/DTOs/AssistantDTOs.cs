namespace SwagBackend.DTOs;

public class VehicleInfoDto
{
    public string Vin { get; set; } = "";
    public string Make { get; set; } = "";
    public string Model { get; set; } = "";
    public string Year { get; set; } = "";
    public string Trim { get; set; } = "";
    public string EngineCylinders { get; set; } = "";
    public string DisplacementL { get; set; } = "";
    public string FuelType { get; set; } = "";
    public string DriveType { get; set; } = "";
    public string BodyClass { get; set; } = "";
    public bool IsPartial { get; set; }
}

public class AssistantMessageDto
{
    public Guid Id { get; set; }
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
    public DateTime SentAt { get; set; }
}

public class AssistantConversationDto
{
    public Guid Id { get; set; }
    public string? Vin { get; set; }
    public VehicleInfoDto? Vehicle { get; set; }
    public string Title { get; set; } = "";
    public string? LastMessage { get; set; }
    public List<AssistantMessageDto> Messages { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateConversationRequest
{
    public string Vin { get; set; } = "";
}

public class AssistantSendMessageRequest
{
    public Guid ConversationId { get; set; }
    public string Message { get; set; } = "";
}

public class AssistantSendMessageResponse
{
    public AssistantMessageDto UserMessage { get; set; } = null!;
    public AssistantMessageDto AssistantReply { get; set; } = null!;
}
