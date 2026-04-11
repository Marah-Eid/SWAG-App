using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SearchController(SwagDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // GET /api/search?q=...&page=1&pageSize=20
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new SearchResultDto());

        var searchTerm = q.Trim().ToLower();
        var myId = _currentUser.UserId;
        var myRole = _currentUser.Role == "Customer" ? UserRole.Customer :
                     _currentUser.Role == "Vendor" ? UserRole.Vendor : UserRole.Admin;

        // 1. Find category item IDs matching by item name or section name
        var matchedItemIds = await _db.VendorCategoryItems
            .Include(i => i.Section)
            .Where(i => i.Name.ToLower().Contains(searchTerm) ||
                        i.Section.Name.ToLower().Contains(searchTerm))
            .Select(i => i.Id)
            .ToListAsync();

        // 2. Find vendor IDs that have selected any of those category items
        var categoryVendorIds = matchedItemIds.Count > 0
            ? await _db.VendorSelectedCategories
                .Where(sc => matchedItemIds.Contains(sc.ItemId))
                .Select(sc => sc.VendorId)
                .Distinct()
                .ToListAsync()
            : new List<Guid>();

        // 3. Query vendors: match by name OR belong to a matched category
        var vendorQuery = _db.Vendors
            .Include(v => v.Reviews)
            .Include(v => v.Followers)
            .Include(v => v.VendorFollowers)
            .Where(v => !v.IsDeleted && v.Status == VendorStatus.Active)
            .Where(v =>
                v.ShopName.ToLower().Contains(searchTerm) ||
                v.FullName.ToLower().Contains(searchTerm) ||
                categoryVendorIds.Contains(v.Id));

        var vendors = await vendorQuery
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // 4. Collect all matched vendor IDs (name-matched + category-matched)
        var pagedVendorIds = vendors.Select(v => v.Id).ToList();
        var allMatchedVendorIds = pagedVendorIds.Union(categoryVendorIds).ToList();

        // 4b. Pre-fetch post IDs tagged with any matched category item (avoids EF Core
        //     translation issues with p.Categories.Any(...) on a local list)
        var categoryPostIds = matchedItemIds.Count > 0
            ? await _db.PostCategories
                .Where(pc => matchedItemIds.Contains(pc.ItemId))
                .Select(pc => pc.PostId)
                .Distinct()
                .ToListAsync()
            : new List<Guid>();

        // 5. Query posts: from matched vendors OR tagged with matched category items
        var postQuery = _db.VendorPosts
            .Include(p => p.Vendor)
            .Include(p => p.Categories)
            .Include(p => p.Likes)
            .Include(p => p.Saves)
            .Include(p => p.Comments)
            .Include(p => p.EventTypes)
            .Include(p => p.CollectionPosts)
            .Where(p => !p.Vendor.IsDeleted && p.Vendor.Status == VendorStatus.Active)
            .Where(p =>
                allMatchedVendorIds.Contains(p.VendorId) ||
                categoryPostIds.Contains(p.Id));

        var posts = await postQuery
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new SearchResultDto
        {
            Vendors = vendors.Select(v => BuildVendorSummary(v, myId, myRole)).ToList(),
            Posts = posts.Select(p => MapPost(p, myId, myRole)).ToList(),
            TotalVendors = vendors.Count,
            TotalPosts = posts.Count
        });
    }

    // ── Helpers (mirrors VendorsController / PostsController) ───────────────

    private static VendorSummaryDto BuildVendorSummary(Vendor v, Guid myId, UserRole myRole)
    {
        bool isFollowed = myRole == UserRole.Customer
            ? v.Followers.Any(f => f.CustomerId == myId)
            : v.VendorFollowers.Any(f => f.FollowerId == myId);

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
            IsFollowed = isFollowed
        };
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
        CategoryIds = p.Categories.Select(c => c.ItemId).ToList(),
        EventTypeIds = p.EventTypes.Select(et => et.EventTypeId).ToList(),
        CollectionIds = p.CollectionPosts.Select(cp => cp.CollectionId).ToList()
    };
}
