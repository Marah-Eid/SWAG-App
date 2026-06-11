using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwagBackend.DTOs;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/assistant")]
[Authorize]
public class AssistantController : ControllerBase
{
    private readonly IAssistantService _assistant;
    private readonly ICurrentUserService _currentUser;

    public AssistantController(IAssistantService assistant, ICurrentUserService currentUser)
    {
        _assistant = assistant;
        _currentUser = currentUser;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var list = await _assistant.GetConversationsAsync(_currentUser.UserId);
        return Ok(list);
    }

    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
    {
        var vin = request.Vin?.Trim().ToUpper() ?? "";
        if (vin.Length != 17)
            return BadRequest(new { message = "VIN must be exactly 17 characters." });

        var conv = await _assistant.CreateConversationAsync(_currentUser.UserId, vin);
        return Ok(conv);
    }

    [HttpGet("conversations/{id}/messages")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        try
        {
            var messages = await _assistant.GetMessagesAsync(id, _currentUser.UserId);
            return Ok(messages);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] AssistantSendMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message cannot be empty." });

        try
        {
            var result = await _assistant.SendMessageAsync(request.ConversationId, _currentUser.UserId, request.Message);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Conversation not found." });
        }
    }

    [HttpDelete("conversations/{id}")]
    public async Task<IActionResult> DeleteConversation(Guid id)
    {
        try
        {
            await _assistant.DeleteConversationAsync(id, _currentUser.UserId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
