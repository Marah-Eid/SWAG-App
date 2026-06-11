using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;

namespace SwagBackend.Services;

public interface IAssistantService
{
    Task<AssistantConversationDto> CreateConversationAsync(Guid customerId, string vin);
    Task<List<AssistantConversationDto>> GetConversationsAsync(Guid customerId);
    Task<List<AssistantMessageDto>> GetMessagesAsync(Guid conversationId, Guid customerId);
    Task<AssistantSendMessageResponse> SendMessageAsync(Guid conversationId, Guid customerId, string message);
    Task DeleteConversationAsync(Guid conversationId, Guid customerId);
}

public class AssistantService : IAssistantService
{
    private readonly SwagDbContext _db;
    private readonly IVinDecodeService _vinDecode;
    private readonly IGroqService _groq;

    public AssistantService(SwagDbContext db, IVinDecodeService vinDecode, IGroqService groq)
    {
        _db = db;
        _vinDecode = vinDecode;
        _groq = groq;
    }

    public async Task<AssistantConversationDto> CreateConversationAsync(Guid customerId, string vin)
    {
        vin = vin.Trim().ToUpper();

        var vehicleInfo = await _vinDecode.DecodeAsync(vin);

        var title = vehicleInfo != null && !string.IsNullOrEmpty(vehicleInfo.Make)
            ? $"{vehicleInfo.Year} {vehicleInfo.Make} {vehicleInfo.Model}".Trim()
            : $"VIN: {vin}";

        var vehicleJson = vehicleInfo != null ? JsonSerializer.Serialize(vehicleInfo) : null;

        var conv = new AssistantConversation
        {
            CustomerId = customerId,
            Vin = vin,
            VehicleInfoJson = vehicleJson,
            Title = title,
        };

        var welcomeText = vehicleInfo != null && !string.IsNullOrEmpty(vehicleInfo.Make)
            ? $"Hi! I found your {title}. I'm your Car Assistant — ask me anything about your vehicle: maintenance, repairs, specs, or anything else!"
            : $"Hi! I couldn't fully decode VIN {vin} but I'll do my best to help. What would you like to know about your car?";

        var welcome = new AssistantMessage
        {
            ConversationId = conv.Id,
            Role = "assistant",
            Content = welcomeText,
        };

        _db.AssistantConversations.Add(conv);
        _db.AssistantMessages.Add(welcome);
        await _db.SaveChangesAsync();

        return ToDto(conv, vehicleInfo, new List<AssistantMessage> { welcome });
    }

    public async Task<List<AssistantConversationDto>> GetConversationsAsync(Guid customerId)
    {
        var convs = await _db.AssistantConversations
            .Where(c => c.CustomerId == customerId)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();

        var result = new List<AssistantConversationDto>();
        foreach (var c in convs)
        {
            var lastMsg = await _db.AssistantMessages
                .Where(m => m.ConversationId == c.Id)
                .OrderByDescending(m => m.SentAt)
                .Select(m => m.Content)
                .FirstOrDefaultAsync();

            var vehicleInfo = c.VehicleInfoJson != null
                ? JsonSerializer.Deserialize<VehicleInfoResult>(c.VehicleInfoJson)
                : null;

            var dto = ToDto(c, vehicleInfo, null);
            dto.LastMessage = lastMsg;
            result.Add(dto);
        }
        return result;
    }

    public async Task<List<AssistantMessageDto>> GetMessagesAsync(Guid conversationId, Guid customerId)
    {
        var conv = await _db.AssistantConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.CustomerId == customerId)
            ?? throw new KeyNotFoundException("Conversation not found");

        return await _db.AssistantMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)
            .Select(m => new AssistantMessageDto { Id = m.Id, Role = m.Role, Content = m.Content, SentAt = m.SentAt })
            .ToListAsync();
    }

    public async Task<AssistantSendMessageResponse> SendMessageAsync(Guid conversationId, Guid customerId, string message)
    {
        var conv = await _db.AssistantConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.CustomerId == customerId)
            ?? throw new KeyNotFoundException("Conversation not found");

        var userMsg = new AssistantMessage
        {
            ConversationId = conversationId,
            Role = "user",
            Content = message.Trim(),
        };
        _db.AssistantMessages.Add(userMsg);

        var history = await _db.AssistantMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Take(10)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        var vehicleInfo = conv.VehicleInfoJson != null
            ? JsonSerializer.Deserialize<VehicleInfoResult>(conv.VehicleInfoJson)
            : null;

        var groqMessages = new List<GroqMessage>
        {
            new("system", BuildSystemPrompt(conv.Vin, vehicleInfo))
        };
        groqMessages.AddRange(history.Select(h => new GroqMessage(h.Role, h.Content)));
        groqMessages.Add(new GroqMessage("user", message.Trim()));

        var reply = await _groq.ChatAsync(groqMessages)
            ?? "I'm sorry, I couldn't process your request right now. Please try again.";

        var assistantMsg = new AssistantMessage
        {
            ConversationId = conversationId,
            Role = "assistant",
            Content = reply,
        };
        _db.AssistantMessages.Add(assistantMsg);
        conv.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new AssistantSendMessageResponse
        {
            UserMessage = ToMsgDto(userMsg),
            AssistantReply = ToMsgDto(assistantMsg),
        };
    }

    public async Task DeleteConversationAsync(Guid conversationId, Guid customerId)
    {
        var conv = await _db.AssistantConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.CustomerId == customerId)
            ?? throw new KeyNotFoundException("Conversation not found");

        _db.AssistantConversations.Remove(conv);
        await _db.SaveChangesAsync();
    }

    private static string BuildSystemPrompt(string? vin, VehicleInfoResult? v)
    {
        if (v != null && !string.IsNullOrEmpty(v.Make))
        {
            var parts = new List<string>();
            if (!string.IsNullOrEmpty(v.Year)) parts.Add($"Year: {v.Year}");
            if (!string.IsNullOrEmpty(v.Make)) parts.Add($"Make: {v.Make}");
            if (!string.IsNullOrEmpty(v.Model)) parts.Add($"Model: {v.Model}");
            if (!string.IsNullOrEmpty(v.Trim)) parts.Add($"Trim: {v.Trim}");
            if (!string.IsNullOrEmpty(v.EngineCylinders)) parts.Add($"Engine: {v.EngineCylinders}-cylinder");
            if (!string.IsNullOrEmpty(v.DisplacementL)) parts.Add($"Displacement: {v.DisplacementL}L");
            if (!string.IsNullOrEmpty(v.FuelType)) parts.Add($"Fuel: {v.FuelType}");
            if (!string.IsNullOrEmpty(v.DriveType)) parts.Add($"Drive: {v.DriveType}");
            if (!string.IsNullOrEmpty(v.BodyClass)) parts.Add($"Body: {v.BodyClass}");

            return "You are SWAG Car Assistant, an expert automotive advisor integrated into the SWAG automotive marketplace app. " +
                   $"The customer's vehicle: {string.Join(", ", parts)}. VIN: {vin}. " +
                   "Help with maintenance schedules, repair guidance, troubleshooting, specs, and general car advice. " +
                   "Be concise and practical. Respond in the same language the user writes in.";
        }

        return "You are SWAG Car Assistant, an expert automotive advisor. " +
               "Help the customer with vehicle maintenance, repairs, troubleshooting, and specifications. " +
               "Be concise and practical. Respond in the same language the user writes in.";
    }

    private static AssistantConversationDto ToDto(AssistantConversation c, VehicleInfoResult? v, List<AssistantMessage>? msgs)
    {
        VehicleInfoDto? vehicleDto = v != null ? new VehicleInfoDto
        {
            Vin = c.Vin ?? "",
            Make = v.Make,
            Model = v.Model,
            Year = v.Year,
            Trim = v.Trim,
            EngineCylinders = v.EngineCylinders,
            DisplacementL = v.DisplacementL,
            FuelType = v.FuelType,
            DriveType = v.DriveType,
            BodyClass = v.BodyClass,
            IsPartial = v.IsPartial,
        } : null;

        return new AssistantConversationDto
        {
            Id = c.Id,
            Vin = c.Vin,
            Vehicle = vehicleDto,
            Title = c.Title,
            Messages = msgs?.Select(ToMsgDto).ToList() ?? new(),
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
        };
    }

    private static AssistantMessageDto ToMsgDto(AssistantMessage m) =>
        new() { Id = m.Id, Role = m.Role, Content = m.Content, SentAt = m.SentAt };
}
