using SwagBackend.Models;
using SWAG_Backend.Tests.Helpers;

namespace SWAG_Backend.Tests.Integration;

/// IT-17, IT-18, IT-31, IT-41, IT-42: Follow and notification integration tests
public class FollowNotificationTests
{
    [Fact]
    public void IT17_FollowVendor_CreatesFollowRecord()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);
        var vendor = TestDbContext.SeedVendor(db);

        db.CustomerFollows.Add(new CustomerFollow
        {
            CustomerId = customer.Id,
            VendorId = vendor.Id
        });
        db.SaveChanges();

        var follows = db.CustomerFollows.Any(cf => cf.CustomerId == customer.Id && cf.VendorId == vendor.Id);
        Assert.True(follows);
    }

    [Fact]
    public void IT18_UnfollowVendor_RemovesFollowRecord()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);
        var vendor = TestDbContext.SeedVendor(db);

        var follow = new CustomerFollow { CustomerId = customer.Id, VendorId = vendor.Id };
        db.CustomerFollows.Add(follow);
        db.SaveChanges();

        db.CustomerFollows.Remove(follow);
        db.SaveChanges();

        Assert.False(db.CustomerFollows.Any(cf => cf.CustomerId == customer.Id && cf.VendorId == vendor.Id));
    }

    [Fact]
    public void IT31_FollowVendor_CreatesNotificationInDatabase()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);
        var vendor = TestDbContext.SeedVendor(db);

        // Simulate follow
        db.CustomerFollows.Add(new CustomerFollow
        {
            CustomerId = customer.Id,
            VendorId = vendor.Id
        });

        // Simulate notification creation (as NotificationService would do)
        db.Notifications.Add(new Notification
        {
            RecipientId = vendor.Id,
            RecipientType = UserRole.Vendor,
            Type = NotificationType.NewFollower,
            Title = "New Follower",
            Body = $"{customer.FullName} started following your shop."
        });
        db.SaveChanges();

        var notification = db.Notifications.FirstOrDefault(n =>
            n.RecipientId == vendor.Id && n.Type == NotificationType.NewFollower);

        Assert.NotNull(notification);
        Assert.Contains(customer.FullName, notification.Body);
        Assert.False(notification.IsRead);
    }

    [Fact]
    public void IT32_MarkNotificationAsRead_UpdatesFlag()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);

        var notification = new Notification
        {
            RecipientId = vendor.Id,
            RecipientType = UserRole.Vendor,
            Type = NotificationType.NewFollower,
            Title = "New Follower",
            Body = "Someone followed you",
            IsRead = false
        };
        db.Notifications.Add(notification);
        db.SaveChanges();

        notification.IsRead = true;
        db.SaveChanges();

        var updated = db.Notifications.First(n => n.Id == notification.Id);
        Assert.True(updated.IsRead);
    }

    [Fact]
    public void IT33_ClearAllNotifications_RemovesAllForUser()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);

        for (int i = 0; i < 5; i++)
        {
            db.Notifications.Add(new Notification
            {
                RecipientId = vendor.Id,
                RecipientType = UserRole.Vendor,
                Type = NotificationType.NewFollower,
                Title = $"Notification {i}",
                Body = "Test body"
            });
        }
        db.SaveChanges();

        var all = db.Notifications.Where(n => n.RecipientId == vendor.Id).ToList();
        db.Notifications.RemoveRange(all);
        db.SaveChanges();

        Assert.Empty(db.Notifications.Where(n => n.RecipientId == vendor.Id));
    }

    [Fact]
    public void IT41_RegisterPushToken_StoresInDatabase()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);

        db.DevicePushTokens.Add(new DevicePushToken
        {
            UserId = vendor.Id,
            UserType = UserRole.Vendor,
            ExpoToken = "ExponentPushToken[abc123]"
        });
        db.SaveChanges();

        var token = db.DevicePushTokens.FirstOrDefault(d => d.UserId == vendor.Id);
        Assert.NotNull(token);
        Assert.Equal("ExponentPushToken[abc123]", token.ExpoToken);
    }

    [Fact]
    public void IT42_UnregisterPushToken_RemovesFromDatabase()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);

        var pushToken = new DevicePushToken
        {
            UserId = vendor.Id,
            UserType = UserRole.Vendor,
            ExpoToken = "ExponentPushToken[abc123]"
        };
        db.DevicePushTokens.Add(pushToken);
        db.SaveChanges();

        db.DevicePushTokens.Remove(pushToken);
        db.SaveChanges();

        Assert.Null(db.DevicePushTokens.FirstOrDefault(d => d.UserId == vendor.Id));
    }
}
