using Microsoft.EntityFrameworkCore;
using SwagBackend.Models;
using SWAG_Backend.Tests.Helpers;

namespace SWAG_Backend.Tests.Integration;

/// IT-09 to IT-15: Post integration tests
public class PostIntegrationTests
{
    [Fact]
    public void IT09_CreatePost_StoresPostInDatabase()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);

        var post = new VendorPost
        {
            VendorId = vendor.Id,
            Description = "New car parts available!",
            Type = PostType.Post,
            MediaType = MediaType.Image,
            PostImage = "https://storage.example.com/post.jpg"
        };

        db.VendorPosts.Add(post);
        db.SaveChanges();

        var saved = db.VendorPosts.FirstOrDefault(p => p.VendorId == vendor.Id);
        Assert.NotNull(saved);
        Assert.Equal("New car parts available!", saved.Description);
        Assert.Equal(PostType.Post, saved.Type);
    }

    [Fact]
    public void IT10_CreateEventPost_StoresEventDetails()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);

        var eventPost = new VendorPost
        {
            VendorId = vendor.Id,
            Description = "Annual car meet",
            Type = PostType.Event,
            EventTitle = "SWAG Car Meet 2026",
            EventDate = "2026-06-15",
            EventTime = "18:00",
            Location = "Amman Downtown"
        };

        db.VendorPosts.Add(eventPost);
        db.SaveChanges();

        var saved = db.VendorPosts.First(p => p.Type == PostType.Event);
        Assert.Equal("SWAG Car Meet 2026", saved.EventTitle);
        Assert.Equal("2026-06-15", saved.EventDate);
        Assert.Equal("Amman Downtown", saved.Location);
    }

    [Fact]
    public void IT11_LikePost_CreatesLikeRecord()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);
        var customer = TestDbContext.SeedCustomer(db);

        var post = new VendorPost
        {
            VendorId = vendor.Id,
            Description = "Check this out",
            Type = PostType.Post
        };
        db.VendorPosts.Add(post);
        db.SaveChanges();

        var like = new PostLike
        {
            PostId = post.Id,
            LikerId = customer.Id,
            LikerType = UserRole.Customer
        };
        db.PostLikes.Add(like);
        db.SaveChanges();

        var likeCount = db.PostLikes.Count(l => l.PostId == post.Id);
        Assert.Equal(1, likeCount);
    }

    [Fact]
    public void IT12_SavePost_CreatesSaveRecord()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);
        var customer = TestDbContext.SeedCustomer(db);

        var post = new VendorPost
        {
            VendorId = vendor.Id,
            Description = "Save this post",
            Type = PostType.Post
        };
        db.VendorPosts.Add(post);
        db.SaveChanges();

        var save = new PostSave
        {
            PostId = post.Id,
            SaverId = customer.Id,
            SaverType = UserRole.Customer
        };
        db.PostSaves.Add(save);
        db.SaveChanges();

        var saveCount = db.PostSaves.Count(s => s.PostId == post.Id);
        Assert.Equal(1, saveCount);
    }

    [Fact]
    public void IT13_AddComment_StoresCommentWithCorrectInfo()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);
        var customer = TestDbContext.SeedCustomer(db);

        var post = new VendorPost
        {
            VendorId = vendor.Id,
            Description = "Comment on this",
            Type = PostType.Post
        };
        db.VendorPosts.Add(post);
        db.SaveChanges();

        var comment = new PostComment
        {
            PostId = post.Id,
            CommenterId = customer.Id,
            CommenterType = UserRole.Customer,
            CommentText = "Great parts!"
        };
        db.PostComments.Add(comment);
        db.SaveChanges();

        var saved = db.PostComments.First(c => c.PostId == post.Id);
        Assert.Equal("Great parts!", saved.CommentText);
        Assert.Equal(customer.Id, saved.CommenterId);
        Assert.Equal(UserRole.Customer, saved.CommenterType);
    }

    [Fact]
    public void IT14_DeletePost_RemovesRelatedRecords()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db);
        var customer = TestDbContext.SeedCustomer(db);

        var post = new VendorPost
        {
            VendorId = vendor.Id,
            Description = "To be deleted",
            Type = PostType.Post
        };
        db.VendorPosts.Add(post);
        db.SaveChanges();

        db.PostLikes.Add(new PostLike { PostId = post.Id, LikerId = customer.Id, LikerType = UserRole.Customer });
        db.PostComments.Add(new PostComment { PostId = post.Id, CommenterId = customer.Id, CommenterType = UserRole.Customer, CommentText = "Nice" });
        db.SaveChanges();

        // Delete related records first, then the post
        db.PostLikes.RemoveRange(db.PostLikes.Where(l => l.PostId == post.Id));
        db.PostComments.RemoveRange(db.PostComments.Where(c => c.PostId == post.Id));
        db.VendorPosts.Remove(post);
        db.SaveChanges();

        Assert.Null(db.VendorPosts.FirstOrDefault(p => p.Id == post.Id));
        Assert.Empty(db.PostLikes.Where(l => l.PostId == post.Id));
        Assert.Empty(db.PostComments.Where(c => c.PostId == post.Id));
    }
}
