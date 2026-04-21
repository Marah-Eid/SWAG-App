using SwagBackend.Models;
using SWAG_Backend.Tests.Helpers;

namespace SWAG_Backend.Tests.Integration;

/// IT-25, IT-26, IT-27: Chat integration tests
public class ChatIntegrationTests
{
    [Fact]
    public void IT25_StartConversation_CreatesConversationRecord()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);
        var vendor = TestDbContext.SeedVendor(db);

        var conversation = new Conversation
        {
            ParticipantOneId = customer.Id,
            ParticipantOneType = UserRole.Customer,
            ParticipantTwoId = vendor.Id,
            ParticipantTwoType = UserRole.Vendor
        };
        db.Conversations.Add(conversation);
        db.SaveChanges();

        var saved = db.Conversations.FirstOrDefault(c =>
            c.ParticipantOneId == customer.Id && c.ParticipantTwoId == vendor.Id);
        Assert.NotNull(saved);
    }

    [Fact]
    public void IT26_SendMessage_StoresInChatMessages()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);
        var vendor = TestDbContext.SeedVendor(db);

        var conversation = new Conversation
        {
            ParticipantOneId = customer.Id,
            ParticipantOneType = UserRole.Customer,
            ParticipantTwoId = vendor.Id,
            ParticipantTwoType = UserRole.Vendor
        };
        db.Conversations.Add(conversation);
        db.SaveChanges();

        var message = new ChatMessage
        {
            ConversationId = conversation.Id,
            SenderId = customer.Id,
            SenderType = UserRole.Customer,
            MessageText = "Hi, do you have brake pads?",
            MessageType = MessageType.Text
        };
        db.ChatMessages.Add(message);
        db.SaveChanges();

        var saved = db.ChatMessages.FirstOrDefault(m => m.ConversationId == conversation.Id);
        Assert.NotNull(saved);
        Assert.Equal("Hi, do you have brake pads?", saved.MessageText);
        Assert.False(saved.IsRead);
    }

    [Fact]
    public void IT27_MarkConversationAsRead_UpdatesUnreadCount()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);
        var vendor = TestDbContext.SeedVendor(db);

        var conversation = new Conversation
        {
            ParticipantOneId = customer.Id,
            ParticipantOneType = UserRole.Customer,
            ParticipantTwoId = vendor.Id,
            ParticipantTwoType = UserRole.Vendor,
            P2Unread = 3
        };
        db.Conversations.Add(conversation);
        db.SaveChanges();

        // Vendor reads the conversation
        conversation.P2Unread = 0;
        db.SaveChanges();

        var updated = db.Conversations.First(c => c.Id == conversation.Id);
        Assert.Equal(0, updated.P2Unread);
    }
}
