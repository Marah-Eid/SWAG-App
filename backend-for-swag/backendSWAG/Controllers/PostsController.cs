using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/posts")]
public class PostsController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public PostsController(SwagDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // GET /api/posts
    [HttpGet]
    public async Task<IActionResult> GetPosts(
        [FromQuery] Guid? vendorId,
        [FromQuery] string? type,          // post | event
        [FromQuery] int? categoryId,
        [FromQuery] string? city,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var query = _db.VendorPosts
            .Include(p => p.Vendor)
            .Include(p => p.Categories)
            .Include(p => p.Likes)
            .Include(p => p.Saves)
            .Include(p => p.Comments)
            .Include(p => p.EventTypes)
            .Where(p => !p.Vendor.IsDeleted && p.Vendor.Status == VendorStatus.Active);

        if (vendorId.HasValue)
            query = query.Where(p => p.VendorId == vendorId.Value);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<PostType>(type, true, out var parsedType))
            query = query.Where(p => p.Type == parsedType);

        if (categoryId.HasValue)
            query = query.Where(p => p.Categories.Any(c => c.ItemId == categoryId.Value));

        if (!string.IsNullOrEmpty(city))
            query = query.Where(p => p.Vendor.City != null && p.Vendor.City.ToLower().Contains(city.ToLower()));

        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(posts.Select(p => MapPost(p, myId, myRole)));
    }

    // GET /api/posts/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPost(Guid id)
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var post = await _db.VendorPosts
            .Include(p => p.Vendor)
            .Include(p => p.Categories)
            .Include(p => p.Likes)
            .Include(p => p.Saves)
            .Include(p => p.Comments)
            .Include(p => p.EventTypes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();
        return Ok(MapPost(post, myId, myRole));
    }

    // POST /api/posts  (Vendor only)
    [HttpPost]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest req)
    {
        if (!Enum.TryParse<PostType>(req.Type, true, out var postType))
            postType = PostType.Post;
        if (!Enum.TryParse<MediaType>(req.MediaType, true, out var mediaType))
            mediaType = MediaType.Image;

        var post = new VendorPost
        {
            VendorId = _currentUser.UserId,
            Description = req.Description,
            PostImage = req.PostImage,
            MediaType = mediaType,
            MediaWidth = req.MediaWidth,
            MediaHeight = req.MediaHeight,
            Type = postType,
            EventTitle = req.EventTitle,
            EventDate = req.EventDate,
            EventTime = req.EventTime,
            EventEndTime = req.EventEndTime,
            Location = req.Location
        };

        _db.VendorPosts.Add(post);
        await _db.SaveChangesAsync();

        // Add categories
        foreach (var catId in req.CategoryIds.Distinct())
        {
            if (await _db.VendorCategoryItems.AnyAsync(i => i.Id == catId))
                _db.PostCategories.Add(new PostCategory { PostId = post.Id, ItemId = catId });
        }

        // Add event types
        foreach (var etId in req.EventTypeIds.Distinct())
        {
            if (await _db.EventTypes.AnyAsync(et => et.Id == etId))
                _db.PostEventTypes.Add(new PostEventType { PostId = post.Id, EventTypeId = etId });
        }

        await _db.SaveChangesAsync();

        // Notify followers
        var followerIds = await _db.CustomerFollows
            .Where(cf => cf.VendorId == _currentUser.UserId)
            .Select(cf => cf.CustomerId)
            .ToListAsync();

        var vendor = await _db.Vendors.FindAsync(_currentUser.UserId);
        var notifType = postType == PostType.Event ? NotificationType.NewEvent : NotificationType.VendorPost;
        var notifTitle = postType == PostType.Event ? "New Event" : "New Post";
        var notifBody = postType == PostType.Event
            ? $"{vendor?.ShopName} posted a new event: {req.EventTitle}"
            : $"{vendor?.ShopName} shared a new post.";

        foreach (var fId in followerIds)
        {
            _db.Notifications.Add(new Notification
            {
                RecipientId = fId,
                RecipientType = UserRole.Customer,
                Type = notifType,
                Title = notifTitle,
                Body = notifBody,
                DeepLink = $"post/{post.Id}"
            });
        }
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, new { post.Id });
    }

    // PUT /api/posts/{id}
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostRequest req)
    {
        var post = await _db.VendorPosts
            .Include(p => p.Categories)
            .Include(p => p.EventTypes)
            .FirstOrDefaultAsync(p => p.Id == id && p.VendorId == _currentUser.UserId);

        if (post == null) return NotFound();

        if (req.Description != null) post.Description = req.Description;
        if (req.PostImage != null) post.PostImage = req.PostImage;
        if (req.EventTitle != null) post.EventTitle = req.EventTitle;
        if (req.EventDate != null) post.EventDate = req.EventDate;
        if (req.EventTime != null) post.EventTime = req.EventTime;
        if (req.EventEndTime != null) post.EventEndTime = req.EventEndTime;
        if (req.Location != null) post.Location = req.Location;
        post.UpdatedAt = DateTime.UtcNow;

        if (req.CategoryIds != null)
        {
            _db.PostCategories.RemoveRange(post.Categories);
            foreach (var catId in req.CategoryIds.Distinct())
            {
                if (await _db.VendorCategoryItems.AnyAsync(i => i.Id == catId))
                    _db.PostCategories.Add(new PostCategory { PostId = post.Id, ItemId = catId });
            }
        }

        if (req.EventTypeIds != null)
        {
            _db.PostEventTypes.RemoveRange(post.EventTypes);
            foreach (var etId in req.EventTypeIds.Distinct())
            {
                if (await _db.EventTypes.AnyAsync(et => et.Id == etId))
                    _db.PostEventTypes.Add(new PostEventType { PostId = post.Id, EventTypeId = etId });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Post updated." });
    }

    // DELETE /api/posts/{id}
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var post = await _db.VendorPosts
            .FirstOrDefaultAsync(p => p.Id == id && p.VendorId == _currentUser.UserId);

        if (post == null) return NotFound();
        _db.VendorPosts.Remove(post);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Post deleted." });
    }

    // POST /api/posts/{id}/like
    [HttpPost("{id:guid}/like")]
    [Authorize]
    public async Task<IActionResult> LikePost(Guid id)
    {
        var post = await _db.VendorPosts.FindAsync(id);
        if (post == null) return NotFound();

        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var existing = await _db.PostLikes
            .FirstOrDefaultAsync(l => l.PostId == id && l.LikerId == myId && l.LikerType == myRole);

        if (existing != null)
        {
            _db.PostLikes.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok(new { liked = false, message = "Like removed." });
        }

        _db.PostLikes.Add(new PostLike { PostId = id, LikerId = myId, LikerType = myRole });
        await _db.SaveChangesAsync();
        return Ok(new { liked = true, message = "Post liked." });
    }

    // POST /api/posts/{id}/save
    [HttpPost("{id:guid}/save")]
    [Authorize]
    public async Task<IActionResult> SavePost(Guid id)
    {
        var post = await _db.VendorPosts.FindAsync(id);
        if (post == null) return NotFound();

        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var existing = await _db.PostSaves
            .FirstOrDefaultAsync(s => s.PostId == id && s.SaverId == myId && s.SaverType == myRole);

        if (existing != null)
        {
            _db.PostSaves.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok(new { saved = false, message = "Post unsaved." });
        }

        _db.PostSaves.Add(new PostSave { PostId = id, SaverId = myId, SaverType = myRole });
        await _db.SaveChangesAsync();
        return Ok(new { saved = true, message = "Post saved." });
    }

    // GET /api/posts/{id}/comments
    [HttpGet("{id:guid}/comments")]
    public async Task<IActionResult> GetComments(Guid id)
    {
        var comments = await _db.PostComments
            .Where(c => c.PostId == id && c.DeletedAt == null)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        // Fetch commenter names
        var result = new List<CommentDto>();
        foreach (var c in comments)
        {
            string name = "User";
            string? image = null;

            if (c.CommenterType == UserRole.Customer)
            {
                var cust = await _db.Customers.FindAsync(c.CommenterId);
                name = cust?.FullName ?? name;
                image = cust?.ProfileImage;
            }
            else if (c.CommenterType == UserRole.Vendor)
            {
                var v = await _db.Vendors.FindAsync(c.CommenterId);
                name = v?.ShopName ?? name;
                image = v?.ProfileImage;
            }

            result.Add(new CommentDto
            {
                Id = c.Id,
                PostId = c.PostId,
                CommenterId = c.CommenterId,
                CommenterType = c.CommenterType.ToString().ToLower(),
                CommenterName = name,
                CommenterImage = image,
                CommentText = c.CommentText,
                CreatedAt = c.CreatedAt
            });
        }

        return Ok(result);
    }

    // POST /api/posts/{id}/comments
    [HttpPost("{id:guid}/comments")]
    [Authorize]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.CommentText))
            return BadRequest(new { message = "Comment text is required." });

        var post = await _db.VendorPosts.FindAsync(id);
        if (post == null) return NotFound();

        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var comment = new PostComment
        {
            PostId = id,
            CommenterId = myId,
            CommenterType = myRole,
            CommentText = req.CommentText.Trim()
        };

        _db.PostComments.Add(comment);
        await _db.SaveChangesAsync();

        // Notify post vendor
        if (post.VendorId != myId)
        {
            string commenterName = "Someone";
            if (myRole == UserRole.Customer)
            {
                var cust = await _db.Customers.FindAsync(myId);
                if (cust != null) commenterName = cust.FullName;
            }
            else if (myRole == UserRole.Vendor)
            {
                var v = await _db.Vendors.FindAsync(myId);
                if (v != null) commenterName = v.ShopName;
            }

            _db.Notifications.Add(new Notification
            {
                RecipientId = post.VendorId,
                RecipientType = UserRole.Vendor,
                Type = NotificationType.Mention,
                Title = "New Comment",
                Body = $"{commenterName} commented on your post.",
                DeepLink = $"post/{id}"
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new { comment.Id, message = "Comment added." });
    }

    // DELETE /api/posts/{id}/comments/{commentId}
    [HttpDelete("{id:guid}/comments/{commentId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(Guid id, Guid commentId)
    {
        var myId = _currentUser.UserId;
        var comment = await _db.PostComments
            .FirstOrDefaultAsync(c => c.Id == commentId && c.PostId == id);

        if (comment == null) return NotFound();

        // Only commenter or post vendor can delete
        var post = await _db.VendorPosts.FindAsync(id);
        if (comment.CommenterId != myId && post?.VendorId != myId)
            return Forbid();

        comment.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Comment deleted." });
    }

    // GET /api/posts/me/likes
    [HttpGet("me/likes")]
    [Authorize]
    public async Task<IActionResult> GetMyLikes()
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var likedPostIds = await _db.PostLikes
            .Where(l => l.LikerId == myId && l.LikerType == myRole)
            .Select(l => l.PostId)
            .ToListAsync();

        var posts = await _db.VendorPosts
            .Include(p => p.Vendor)
            .Include(p => p.Categories)
            .Include(p => p.Likes)
            .Include(p => p.Saves)
            .Include(p => p.Comments)
            .Include(p => p.EventTypes)
            .Where(p => likedPostIds.Contains(p.Id) && !p.Vendor.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(posts.Select(p => MapPost(p, myId, myRole)));
    }

    // GET /api/posts/me/comments
    [HttpGet("me/comments")]
    [Authorize]
    public async Task<IActionResult> GetMyComments()
    {
        var myId = _currentUser.UserId;
        var myRole = ParseRole(_currentUser.Role);

        var comments = await _db.PostComments
            .Where(c => c.CommenterId == myId && c.CommenterType == myRole && c.DeletedAt == null)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = new List<MyCommentDto>();
        foreach (var c in comments)
        {
            var post = await _db.VendorPosts
                .Include(p => p.Vendor)
                .FirstOrDefaultAsync(p => p.Id == c.PostId);

            result.Add(new MyCommentDto
            {
                Id = c.Id,
                PostId = c.PostId,
                VendorName = post?.Vendor?.ShopName ?? "Unknown",
                VendorLogo = post?.Vendor?.ProfileImage,
                CommentText = c.CommentText,
                CreatedAt = c.CreatedAt
            });
        }

        return Ok(result);
    }

    // POST /api/reviews
    [HttpPost("/api/reviews")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> AddReview([FromBody] AddReviewRequest req)
    {
        if (req.Rating < 1 || req.Rating > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5." });

        if (string.IsNullOrWhiteSpace(req.Feedback))
            return BadRequest(new { message = "Feedback is required." });

        var vendor = await _db.Vendors.FindAsync(req.VendorId);
        if (vendor == null) return NotFound(new { message = "Vendor not found." });

        var myId = _currentUser.UserId;

        _db.Reviews.Add(new Review
        {
            VendorId = req.VendorId,
            CustomerId = myId,
            Rating = (short)req.Rating,
            Feedback = req.Feedback.Trim()
        });

        var reviewer = await _db.Customers.FindAsync(myId);
        string reviewerName = reviewer?.FullName ?? "Someone";

        _db.Notifications.Add(new Notification
        {
            RecipientId = req.VendorId,
            RecipientType = UserRole.Vendor,
            Type = NotificationType.NewReview,
            Title = "New Review",
            Body = $"{reviewerName} left you a {req.Rating}-star review.",
            DeepLink = $"vendor/{req.VendorId}/reviews"
        });

        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Review submitted." });
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private static PostDto MapPost(VendorPost p, Guid myId, UserRole myRole) => new()
    {
        Id = p.Id,
        VendorId = p.VendorId,
        VendorShopName = p.Vendor.ShopName,
        VendorProfileImage = p.Vendor.ProfileImage,
        Description = p.Description,
        PostImage = p.PostImage,
        MediaType = p.MediaType.ToString().ToLower(),
        MediaWidth = p.MediaWidth,
        MediaHeight = p.MediaHeight,
        Type = p.Type.ToString().ToLower(),
        EventTitle = p.EventTitle,
        EventDate = p.EventDate,
        EventTime = p.EventTime,
        EventEndTime = p.EventEndTime,
        Location = p.Location,
        CreatedAt = p.CreatedAt,
        LikeCount = p.Likes.Count,
        CommentCount = p.Comments.Count(c => c.DeletedAt == null),
        SaveCount = p.Saves.Count,
        IsLiked = p.Likes.Any(l => l.LikerId == myId && l.LikerType == myRole),
        IsSaved = p.Saves.Any(s => s.SaverId == myId && s.SaverType == myRole),
        CategoryIds = p.Categories.Select(c => c.ItemId).ToList(),
        EventTypeIds = p.EventTypes.Select(et => et.EventTypeId).ToList()
    };

    private static UserRole ParseRole(string role) => role switch
    {
        "Customer" => UserRole.Customer,
        "Vendor" => UserRole.Vendor,
        "Admin" => UserRole.Admin,
        _ => UserRole.Customer
    };
}
