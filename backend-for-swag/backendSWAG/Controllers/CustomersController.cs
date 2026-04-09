using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Roles = "Customer")]
public class CustomersController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CustomersController(SwagDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // GET /api/customers/me
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var customer = await _db.Customers
            .Include(c => c.Interests)
            .FirstOrDefaultAsync(c => c.Id == _currentUser.UserId && !c.IsDeleted);

        if (customer == null) return NotFound();

        return Ok(new CustomerProfileDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Email = customer.Email,
            Phone = customer.Phone,
            City = customer.City,
            ProfileImage = customer.ProfileImage,
            BannerImage = customer.BannerImage,
            Language = customer.Language,
            DarkMode = customer.DarkMode,
            PushNotifications = customer.PushNotifications,
            IsVerified = customer.IsVerified,
            CreatedAt = customer.CreatedAt,
            InterestIds = customer.Interests.Select(i => i.ItemId).ToList()
        });
    }

    // PUT /api/customers/me
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerRequest req)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == _currentUser.UserId && !c.IsDeleted);

        if (customer == null) return NotFound();

        if (req.FullName != null) customer.FullName = req.FullName.Trim();
        if (req.City != null) customer.City = req.City.Trim();
        if (req.ProfileImage != null) customer.ProfileImage = req.ProfileImage;
        if (req.BannerImage != null) customer.BannerImage = req.BannerImage;
        if (req.Language != null) customer.Language = req.Language;
        if (req.DarkMode.HasValue) customer.DarkMode = req.DarkMode.Value;
        if (req.PushNotifications.HasValue) customer.PushNotifications = req.PushNotifications.Value;
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var updated = await _db.Customers
            .Include(c => c.Interests)
            .FirstOrDefaultAsync(c => c.Id == _currentUser.UserId);

        return Ok(new CustomerProfileDto
        {
            Id = updated!.Id,
            FullName = updated.FullName,
            Email = updated.Email,
            Phone = updated.Phone,
            City = updated.City,
            ProfileImage = updated.ProfileImage,
            BannerImage = updated.BannerImage,
            Language = updated.Language,
            DarkMode = updated.DarkMode,
            PushNotifications = updated.PushNotifications,
            IsVerified = updated.IsVerified,
            CreatedAt = updated.CreatedAt,
            InterestIds = updated.Interests.Select(i => i.ItemId).ToList()
        });
    }

    // GET /api/customers/{id}/public  (any authenticated user)
    [HttpGet("{id:guid}/public")]
    public async Task<IActionResult> GetCustomerPublic(Guid id)
    {
        var customer = await _db.Customers
            .Include(c => c.Cars)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (customer == null) return NotFound();

        return Ok(new
        {
            id = customer.Id,
            fullName = customer.FullName,
            profileImage = customer.ProfileImage,
            bannerImage = customer.BannerImage,
            cars = customer.Cars.Select(c => new
            {
                brand = c.Brand,
                model = c.Model
            }).ToList()
        });
    }

    // GET /api/customers/me/interests
    [HttpGet("me/interests")]
    public async Task<IActionResult> GetInterests()
    {
        var interests = await _db.CustomerInterests
            .Where(ci => ci.CustomerId == _currentUser.UserId)
            .Include(ci => ci.Item)
            .ThenInclude(i => i.Section)
            .Select(ci => new CategoryItemDto
            {
                Id = ci.Item.Id,
                SectionId = ci.Item.SectionId,
                Name = ci.Item.Name
            })
            .ToListAsync();

        return Ok(interests);
    }

    // POST /api/customers/me/interests  (replaces all)
    [HttpPost("me/interests")]
    public async Task<IActionResult> SetInterests([FromBody] SetInterestsRequest req)
    {
        var existing = _db.CustomerInterests.Where(ci => ci.CustomerId == _currentUser.UserId);
        _db.CustomerInterests.RemoveRange(existing);

        if (req.ItemIds.Count > 0)
        {
            var validIds = await _db.VendorCategoryItems
                .Where(i => req.ItemIds.Contains(i.Id))
                .Select(i => i.Id)
                .ToListAsync();

            foreach (var id in validIds)
            {
                _db.CustomerInterests.Add(new CustomerInterest
                {
                    CustomerId = _currentUser.UserId,
                    ItemId = id
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Interests updated." });
    }

    // GET /api/customers/me/following
    [HttpGet("me/following")]
    public async Task<IActionResult> GetFollowing()
    {
        var myId = _currentUser.UserId;
        var follows = await _db.CustomerFollows
            .Where(cf => cf.CustomerId == myId && !cf.Vendor.IsDeleted)
            .Include(cf => cf.Vendor)
                .ThenInclude(v => v.Reviews)
            .Include(cf => cf.Vendor)
                .ThenInclude(v => v.Followers)
            .Include(cf => cf.Vendor)
                .ThenInclude(v => v.VendorFollowers)
            .ToListAsync();

        return Ok(follows.Select(cf =>
        {
            var v = cf.Vendor;
            return new VendorSummaryDto
            {
                Id = v.Id,
                FullName = v.FullName,
                ShopName = v.ShopName,
                ShopType = v.ShopType,
                City = v.City,
                ProfileImage = v.ProfileImage,
                BannerImage = v.BannerImage,
                Bio = v.Bio,
                Status = v.Status.ToString().ToLower(),
                AverageRating = v.Reviews.Count > 0 ? Math.Round(v.Reviews.Average(r => (double)r.Rating), 1) : 0,
                ReviewCount = v.Reviews.Count,
                FollowerCount = v.Followers.Count + v.VendorFollowers.Count,
                IsFollowed = true
            };
        }));
    }

    // POST /api/customers/me/following/{vendorId}
    [HttpPost("me/following/{vendorId:guid}")]
    public async Task<IActionResult> FollowVendor(Guid vendorId)
    {
        var vendor = await _db.Vendors.FirstOrDefaultAsync(v => v.Id == vendorId && !v.IsDeleted);
        if (vendor == null) return NotFound(new { message = "Vendor not found." });

        bool alreadyFollows = await _db.CustomerFollows
            .AnyAsync(cf => cf.CustomerId == _currentUser.UserId && cf.VendorId == vendorId);

        if (alreadyFollows) return Ok(new MessageResponse { Message = "Already following." });

        _db.CustomerFollows.Add(new CustomerFollow
        {
            CustomerId = _currentUser.UserId,
            VendorId = vendorId
        });

        var follower = await _db.Customers.FindAsync(_currentUser.UserId);
        string followerName = follower?.FullName ?? "Someone";

        _db.Notifications.Add(new Notification
        {
            RecipientId = vendorId,
            RecipientType = UserRole.Vendor,
            Type = NotificationType.NewFollower,
            Title = "New Follower",
            Body = $"{followerName} started following your shop."
        });

        await _db.SaveChangesAsync();

        return Ok(new MessageResponse { Message = "Followed successfully." });
    }

    // DELETE /api/customers/me/following/{vendorId}
    [HttpDelete("me/following/{vendorId:guid}")]
    public async Task<IActionResult> UnfollowVendor(Guid vendorId)
    {
        var follow = await _db.CustomerFollows
            .FirstOrDefaultAsync(cf => cf.CustomerId == _currentUser.UserId && cf.VendorId == vendorId);

        if (follow == null) return NotFound(new { message = "Not following this vendor." });

        _db.CustomerFollows.Remove(follow);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Unfollowed successfully." });
    }

    // GET /api/customers/me/saved-posts
    [HttpGet("me/saved-posts")]
    public async Task<IActionResult> GetSavedPosts()
    {
        var myId = _currentUser.UserId;
        var posts = await _db.PostSaves
            .Where(ps => ps.SaverId == myId && ps.SaverType == UserRole.Customer)
            .Include(ps => ps.Post)
                .ThenInclude(p => p.Vendor)
            .Include(ps => ps.Post)
                .ThenInclude(p => p.Categories)
            .OrderByDescending(ps => ps.CreatedAt)
            .Select(ps => MapPost(ps.Post, myId, UserRole.Customer))
            .ToListAsync();

        return Ok(posts);
    }

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
        CategoryIds = p.Categories.Select(c => c.ItemId).ToList()
    };
}
