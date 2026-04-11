using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/vendors")]
public class VendorsController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public VendorsController(SwagDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // GET /api/vendors  (public - explore)
    [HttpGet]
    public async Task<IActionResult> GetVendors(
        [FromQuery] string? city,
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] string? status = "active",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var myId = _currentUser.UserId;
        var myRole = _currentUser.Role == "Customer" ? UserRole.Customer :
                     _currentUser.Role == "Vendor" ? UserRole.Vendor : UserRole.Admin;

        var query = _db.Vendors
            .Include(v => v.Reviews)
            .Include(v => v.Followers)
            .Include(v => v.VendorFollowers)
            .Where(v => !v.IsDeleted);

        if (status != null && Enum.TryParse<VendorStatus>(status, true, out var parsedStatus))
            query = query.Where(v => v.Status == parsedStatus);

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(v => v.City != null && v.City.ToLower().Contains(city.ToLower()));

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(v =>
                v.ShopName.ToLower().Contains(search.ToLower()) ||
                v.FullName.ToLower().Contains(search.ToLower()));

        if (categoryId.HasValue)
            query = query.Where(v => v.SelectedCategories.Any(sc => sc.ItemId == categoryId.Value));

        var vendors = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(vendors.Select(v => BuildVendorSummary(v, myId, myRole)));
    }

    // GET /api/vendors/me  (vendor only)
    [HttpGet("me")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> GetMyProfile()
    {
        var vendor = await _db.Vendors
            .Include(v => v.ProfileDetail)
            .Include(v => v.SelectedCategories)
            .Include(v => v.Reviews)
            .Include(v => v.Followers)
            .Include(v => v.VendorFollowers)
            .Include(v => v.VendorFollowing)
            .Include(v => v.Posts)
            .FirstOrDefaultAsync(v => v.Id == _currentUser.UserId && !v.IsDeleted);

        if (vendor == null) return NotFound();

        return Ok(BuildVendorProfile(vendor, _currentUser.UserId, UserRole.Vendor));
    }

    // GET /api/vendors/{id}  (public)
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetVendorById(Guid id)
    {
        var vendor = await _db.Vendors
            .Include(v => v.ProfileDetail)
            .Include(v => v.SelectedCategories)
            .Include(v => v.Reviews)
            .Include(v => v.Followers)
            .Include(v => v.VendorFollowers)
            .Include(v => v.VendorFollowing)
            .Include(v => v.Posts)
            .FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);

        if (vendor == null) return NotFound();

        var myId = _currentUser.UserId;
        var myRole = _currentUser.Role == "Customer" ? UserRole.Customer : UserRole.Vendor;

        return Ok(BuildVendorProfile(vendor, myId, myRole));
    }

    // GET /api/vendors/event-coordinators  (public)
    [HttpGet("event-coordinators")]
    public async Task<IActionResult> GetEventCoordinators([FromQuery] int limit = 10)
    {
        var myId = _currentUser.UserId;
        var myRole = _currentUser.Role == "Customer" ? UserRole.Customer :
                     _currentUser.Role == "Vendor" ? UserRole.Vendor : UserRole.Admin;

        var vendorIds = await _db.VendorPosts
            .Where(p => p.Type == PostType.Event && !p.Vendor.IsDeleted && p.Vendor.Status == VendorStatus.Active)
            .GroupBy(p => p.VendorId)
            .OrderByDescending(g => g.Count())
            .Take(limit)
            .Select(g => g.Key)
            .ToListAsync();

        var vendors = await _db.Vendors
            .Include(v => v.Reviews)
            .Include(v => v.Followers)
            .Include(v => v.VendorFollowers)
            .Where(v => vendorIds.Contains(v.Id) && !v.IsDeleted)
            .ToListAsync();

        // Preserve event-count ordering
        var ordered = vendorIds
            .Select(id => vendors.FirstOrDefault(v => v.Id == id))
            .Where(v => v != null)
            .Select(v => BuildVendorSummary(v!, myId, myRole));

        return Ok(ordered);
    }

    // PUT /api/vendors/me
    [HttpPut("me")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateVendorRequest req)
    {
        var vendor = await _db.Vendors
            .FirstOrDefaultAsync(v => v.Id == _currentUser.UserId && !v.IsDeleted);

        if (vendor == null) return NotFound();

        if (req.FullName != null) vendor.FullName = req.FullName.Trim();
        if (req.ShopName != null) vendor.ShopName = req.ShopName.Trim();
        if (req.ShopType != null) vendor.ShopType = req.ShopType.Trim();
        if (req.City != null) vendor.City = req.City.Trim();
        if (req.Bio != null) vendor.Bio = req.Bio;
        if (req.ProfileImage != null) vendor.ProfileImage = req.ProfileImage;
        if (req.BannerImage != null) vendor.BannerImage = req.BannerImage;
        if (req.Phone != null) vendor.Phone = req.Phone;
        if (req.LocationUrl != null) vendor.LocationUrl = req.LocationUrl;
        if (req.LocationLat.HasValue) vendor.LocationLat = req.LocationLat;
        if (req.LocationLng.HasValue) vendor.LocationLng = req.LocationLng;
        if (req.CommercialRegNumber != null) vendor.CommercialRegNumber = req.CommercialRegNumber;
        if (req.Language != null) vendor.Language = req.Language;
        if (req.DarkMode.HasValue) vendor.DarkMode = req.DarkMode.Value;
        if (req.PushNotifications.HasValue) vendor.PushNotifications = req.PushNotifications.Value;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var updated = await _db.Vendors
            .Include(v => v.ProfileDetail)
            .Include(v => v.SelectedCategories)
            .Include(v => v.Reviews)
            .Include(v => v.Followers)
            .Include(v => v.VendorFollowers)
            .Include(v => v.VendorFollowing)
            .Include(v => v.Posts)
            .FirstOrDefaultAsync(v => v.Id == _currentUser.UserId);

        return Ok(BuildVendorProfile(updated!, _currentUser.UserId, UserRole.Vendor));
    }

    // PUT /api/vendors/me/profile-details
    [HttpPut("me/profile-details")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> UpdateProfileDetails([FromBody] UpdateVendorProfileDetailRequest req)
    {
        var detail = await _db.VendorProfileDetails
            .FirstOrDefaultAsync(d => d.VendorId == _currentUser.UserId);

        if (detail == null)
        {
            detail = new VendorProfileDetail { VendorId = _currentUser.UserId };
            _db.VendorProfileDetails.Add(detail);
        }

        if (req.Address != null) detail.Address = req.Address;
        if (req.Whatsapp != null) detail.Whatsapp = req.Whatsapp;
        if (req.InstagramUrl != null) detail.InstagramUrl = req.InstagramUrl;

        if (req.OpenTime != null && TimeOnly.TryParse(req.OpenTime, out var open))
            detail.OpenTime = open;
        if (req.CloseTime != null && TimeOnly.TryParse(req.CloseTime, out var close))
            detail.CloseTime = close;

        detail.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Profile details updated." });
    }

    // GET /api/vendors/me/categories
    [HttpGet("me/categories")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> GetMyCategories()
    {
        var cats = await _db.VendorSelectedCategories
            .Where(sc => sc.VendorId == _currentUser.UserId)
            .Include(sc => sc.Item)
            .ThenInclude(i => i.Section)
            .Select(sc => new CategoryItemDto
            {
                Id = sc.Item.Id,
                SectionId = sc.Item.SectionId,
                Name = sc.Item.Name
            })
            .ToListAsync();

        return Ok(cats);
    }

    // POST /api/vendors/me/categories
    [HttpPost("me/categories")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> AddCategory([FromBody] AddVendorCategoryRequest req)
    {
        bool exists = await _db.VendorCategoryItems.AnyAsync(i => i.Id == req.ItemId);
        if (!exists) return NotFound(new { message = "Category item not found." });

        bool alreadyAdded = await _db.VendorSelectedCategories
            .AnyAsync(sc => sc.VendorId == _currentUser.UserId && sc.ItemId == req.ItemId);

        if (!alreadyAdded)
        {
            _db.VendorSelectedCategories.Add(new VendorSelectedCategory
            {
                VendorId = _currentUser.UserId,
                ItemId = req.ItemId
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new MessageResponse { Message = "Category added." });
    }

    // DELETE /api/vendors/me/categories/{itemId}
    [HttpDelete("me/categories/{itemId:int}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> RemoveCategory(int itemId)
    {
        var sc = await _db.VendorSelectedCategories
            .FirstOrDefaultAsync(sc => sc.VendorId == _currentUser.UserId && sc.ItemId == itemId);

        if (sc == null) return NotFound();
        _db.VendorSelectedCategories.Remove(sc);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Category removed." });
    }

    // GET /api/vendors/{id}/followers
    [HttpGet("{id:guid}/followers")]
    public async Task<IActionResult> GetFollowers(Guid id)
    {
        var customerFollowers = await _db.CustomerFollows
            .Where(cf => cf.VendorId == id)
            .Include(cf => cf.Customer)
            .Select(cf => new {
                id = cf.Customer.Id,
                fullName = cf.Customer.FullName,
                profileImage = cf.Customer.ProfileImage,
                bannerImage = cf.Customer.BannerImage,
                userType = "customer"
            })
            .ToListAsync();

        var vendorFollowers = await _db.VendorFollows
            .Where(vf => vf.FollowingId == id)
            .Include(vf => vf.Follower)
            .Where(vf => !vf.Follower.IsDeleted)
            .Select(vf => new {
                id = vf.Follower.Id,
                fullName = vf.Follower.FullName,
                shopName = (string?)vf.Follower.ShopName,
                profileImage = vf.Follower.ProfileImage,
                bannerImage = vf.Follower.BannerImage,
                userType = "vendor"
            })
            .ToListAsync();

        var allFollowers = customerFollowers
            .Select(c => new { c.id, c.fullName, shopName = (string?)null, c.profileImage, c.bannerImage, c.userType })
            .Concat(vendorFollowers.Select(v => new { v.id, v.fullName, v.shopName, v.profileImage, v.bannerImage, v.userType }))
            .ToList();

        return Ok(allFollowers);
    }

    // GET /api/vendors/{id}/reviews
    [HttpGet("{id:guid}/reviews")]
    public async Task<IActionResult> GetReviews(Guid id)
    {
        var reviews = await _db.Reviews
            .Where(r => r.VendorId == id)
            .Include(r => r.Customer)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                VendorId = r.VendorId,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                CustomerImage = r.Customer.ProfileImage,
                Rating = r.Rating,
                Feedback = r.Feedback,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        double avg = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;

        return Ok(new { averageRating = Math.Round(avg, 1), reviewCount = reviews.Count, reviews });
    }

    // GET /api/vendors/{id}/following  (public — view any vendor's following list)
    [HttpGet("{id:guid}/following")]
    public async Task<IActionResult> GetVendorFollowingById(Guid id)
    {
        var follows = await _db.VendorFollows
            .Where(vf => vf.FollowerId == id && !vf.Following.IsDeleted)
            .Include(vf => vf.Following)
                .ThenInclude(v => v.Reviews)
            .Include(vf => vf.Following)
                .ThenInclude(v => v.Followers)
            .Include(vf => vf.Following)
                .ThenInclude(v => v.VendorFollowers)
            .ToListAsync();

        return Ok(follows.Select(vf =>
        {
            var v = vf.Following;
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
                IsFollowed = false
            };
        }));
    }

    // GET /api/vendors/me/following  (vendor follows vendors)
    [HttpGet("me/following")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> GetVendorFollowing()
    {
        var myId = _currentUser.UserId;
        var follows = await _db.VendorFollows
            .Where(vf => vf.FollowerId == myId && !vf.Following.IsDeleted)
            .Include(vf => vf.Following)
                .ThenInclude(v => v.Reviews)
            .Include(vf => vf.Following)
                .ThenInclude(v => v.Followers)
            .Include(vf => vf.Following)
                .ThenInclude(v => v.VendorFollowers)
            .ToListAsync();

        return Ok(follows.Select(vf =>
        {
            var v = vf.Following;
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

    // POST /api/vendors/me/following/{vendorId}
    [HttpPost("me/following/{vendorId:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> FollowVendor(Guid vendorId)
    {
        if (vendorId == _currentUser.UserId)
            return BadRequest(new { message = "Cannot follow yourself." });

        var target = await _db.Vendors.FirstOrDefaultAsync(v => v.Id == vendorId && !v.IsDeleted);
        if (target == null) return NotFound();

        bool alreadyFollows = await _db.VendorFollows
            .AnyAsync(vf => vf.FollowerId == _currentUser.UserId && vf.FollowingId == vendorId);

        if (!alreadyFollows)
        {
            _db.VendorFollows.Add(new VendorFollow
            {
                FollowerId = _currentUser.UserId,
                FollowingId = vendorId
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new MessageResponse { Message = "Followed." });
    }

    // DELETE /api/vendors/me/following/{vendorId}
    [HttpDelete("me/following/{vendorId:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> UnfollowVendor(Guid vendorId)
    {
        var follow = await _db.VendorFollows
            .FirstOrDefaultAsync(vf => vf.FollowerId == _currentUser.UserId && vf.FollowingId == vendorId);

        if (follow == null) return NotFound();
        _db.VendorFollows.Remove(follow);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Unfollowed." });
    }

    // GET /api/vendors/me/saved-posts
    [HttpGet("me/saved-posts")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> GetSavedPosts()
    {
        var myId = _currentUser.UserId;
        var saves = await _db.PostSaves
            .Where(ps => ps.SaverId == myId && ps.SaverType == UserRole.Vendor)
            .Include(ps => ps.Post).ThenInclude(p => p.Vendor)
            .Include(ps => ps.Post).ThenInclude(p => p.Likes)
            .Include(ps => ps.Post).ThenInclude(p => p.Saves)
            .Include(ps => ps.Post).ThenInclude(p => p.Comments)
            .Include(ps => ps.Post).ThenInclude(p => p.Categories)
            .Include(ps => ps.Post).ThenInclude(p => p.CollectionPosts)
            .OrderByDescending(ps => ps.CreatedAt)
            .ToListAsync();

        var result = saves.Select(ps =>
        {
            var p = ps.Post;
            return new PostDto
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
                IsLiked = p.Likes.Any(l => l.LikerId == myId && l.LikerType == UserRole.Vendor),
                IsSaved = true,
                CategoryIds = p.Categories.Select(c => c.ItemId).ToList(),
                CollectionIds = p.CollectionPosts.Select(cp => cp.CollectionId).ToList()
            };
        });

        return Ok(result);
    }

    // GET /api/vendors/me/collections
    [HttpGet("me/collections")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> GetCollections()
    {
        var collections = await _db.VendorCollections
            .Where(vc => vc.VendorId == _currentUser.UserId)
            .Include(vc => vc.Posts)
            .OrderByDescending(vc => vc.CreatedAt)
            .Select(vc => new VendorCollectionDto
            {
                Id = vc.Id,
                Name = vc.Name,
                Description = vc.Description,
                CreatedAt = vc.CreatedAt,
                UpdatedAt = vc.UpdatedAt,
                PostCount = vc.Posts.Count,
                PostIds = vc.Posts.Select(cp => cp.PostId).ToList()
            })
            .ToListAsync();

        return Ok(collections);
    }

    // GET /api/vendors/{vendorId}/collections  (public)
    [HttpGet("{vendorId:guid}/collections")]
    [Authorize]
    public async Task<IActionResult> GetVendorCollections(Guid vendorId)
    {
        var collections = await _db.VendorCollections
            .Where(vc => vc.VendorId == vendorId)
            .Include(vc => vc.Posts)
            .OrderByDescending(vc => vc.CreatedAt)
            .Select(vc => new VendorCollectionDto
            {
                Id = vc.Id,
                Name = vc.Name,
                Description = vc.Description,
                CreatedAt = vc.CreatedAt,
                UpdatedAt = vc.UpdatedAt,
                PostCount = vc.Posts.Count,
                PostIds = vc.Posts.Select(cp => cp.PostId).ToList()
            })
            .ToListAsync();

        return Ok(collections);
    }

    // POST /api/vendors/me/collections
    [HttpPost("me/collections")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> CreateCollection([FromBody] CreateCollectionRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Collection name is required." });

        var collection = new VendorCollection
        {
            VendorId = _currentUser.UserId,
            Name = req.Name.Trim(),
            Description = req.Description
        };

        _db.VendorCollections.Add(collection);
        await _db.SaveChangesAsync();

        var addedPostIds = new List<Guid>();
        if (req.PostIds != null && req.PostIds.Count > 0)
        {
            var ownedPostIds = await _db.VendorPosts
                .Where(p => p.VendorId == _currentUser.UserId && req.PostIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            foreach (var postId in ownedPostIds.Distinct())
            {
                _db.VendorCollectionPosts.Add(new VendorCollectionPost
                {
                    CollectionId = collection.Id,
                    PostId = postId
                });
                addedPostIds.Add(postId);
            }
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetCollections), new VendorCollectionDto
        {
            Id = collection.Id,
            Name = collection.Name,
            Description = collection.Description,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
            PostCount = addedPostIds.Count,
            PostIds = addedPostIds
        });
    }

    // PUT /api/vendors/me/collections/{collectionId}
    [HttpPut("me/collections/{collectionId:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> UpdateCollection(Guid collectionId, [FromBody] UpdateCollectionRequest req)
    {
        var collection = await _db.VendorCollections
            .Include(vc => vc.Posts)
            .FirstOrDefaultAsync(vc => vc.Id == collectionId && vc.VendorId == _currentUser.UserId);

        if (collection == null) return NotFound(new { message = "Collection not found." });

        if (req.Name != null)
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "Collection name cannot be empty." });
            collection.Name = req.Name.Trim();
        }

        if (req.Description != null)
            collection.Description = req.Description;

        if (req.PostIds != null)
        {
            _db.VendorCollectionPosts.RemoveRange(collection.Posts);

            var ownedPostIds = await _db.VendorPosts
                .Where(p => p.VendorId == _currentUser.UserId && req.PostIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            foreach (var postId in ownedPostIds.Distinct())
            {
                _db.VendorCollectionPosts.Add(new VendorCollectionPost
                {
                    CollectionId = collection.Id,
                    PostId = postId
                });
            }
        }

        collection.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var postIds = await _db.VendorCollectionPosts
            .Where(cp => cp.CollectionId == collection.Id)
            .Select(cp => cp.PostId)
            .ToListAsync();

        return Ok(new VendorCollectionDto
        {
            Id = collection.Id,
            Name = collection.Name,
            Description = collection.Description,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
            PostCount = postIds.Count,
            PostIds = postIds
        });
    }

    // DELETE /api/vendors/me/collections/{collectionId}
    [HttpDelete("me/collections/{collectionId:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> DeleteCollection(Guid collectionId)
    {
        var col = await _db.VendorCollections
            .FirstOrDefaultAsync(vc => vc.Id == collectionId && vc.VendorId == _currentUser.UserId);

        if (col == null) return NotFound();
        _db.VendorCollections.Remove(col);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Collection deleted." });
    }

    // POST /api/vendors/me/collections/{collectionId}/posts/{postId}
    [HttpPost("me/collections/{collectionId:guid}/posts/{postId:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> AddPostToCollection(Guid collectionId, Guid postId)
    {
        var col = await _db.VendorCollections
            .FirstOrDefaultAsync(vc => vc.Id == collectionId && vc.VendorId == _currentUser.UserId);
        if (col == null) return NotFound(new { message = "Collection not found." });

        var post = await _db.VendorPosts.FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null) return NotFound(new { message = "Post not found." });

        bool exists = await _db.VendorCollectionPosts
            .AnyAsync(cp => cp.CollectionId == collectionId && cp.PostId == postId);

        if (!exists)
        {
            _db.VendorCollectionPosts.Add(new VendorCollectionPost
            {
                CollectionId = collectionId,
                PostId = postId
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new MessageResponse { Message = "Post added to collection." });
    }

    // DELETE /api/vendors/me/collections/{collectionId}/posts/{postId}
    [HttpDelete("me/collections/{collectionId:guid}/posts/{postId:guid}")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> RemovePostFromCollection(Guid collectionId, Guid postId)
    {
        var cp = await _db.VendorCollectionPosts
            .FirstOrDefaultAsync(cp => cp.CollectionId == collectionId && cp.PostId == postId);

        if (cp == null) return NotFound();
        _db.VendorCollectionPosts.Remove(cp);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Post removed from collection." });
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

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

    private static VendorProfileDto BuildVendorProfile(Vendor v, Guid myId, UserRole myRole)
    {
        bool isFollowed = myRole == UserRole.Customer
            ? v.Followers.Any(f => f.CustomerId == myId)
            : v.VendorFollowers.Any(f => f.FollowerId == myId);

        return new VendorProfileDto
        {
            Id = v.Id,
            FullName = v.FullName,
            ShopName = v.ShopName,
            ShopType = v.ShopType,
            Email = v.Email,
            Phone = v.Phone,
            City = v.City,
            LocationUrl = v.LocationUrl,
            LocationLat = v.LocationLat,
            LocationLng = v.LocationLng,
            CommercialRegNumber = v.CommercialRegNumber,
            Bio = v.Bio,
            ProfileImage = v.ProfileImage,
            BannerImage = v.BannerImage,
            Status = v.Status.ToString().ToLower(),
            Language = v.Language,
            DarkMode = v.DarkMode,
            PushNotifications = v.PushNotifications,
            IsVerified = v.IsVerified,
            CreatedAt = v.CreatedAt,
            Address = v.ProfileDetail?.Address,
            Whatsapp = v.ProfileDetail?.Whatsapp,
            InstagramUrl = v.ProfileDetail?.InstagramUrl,
            OpenTime = v.ProfileDetail?.OpenTime?.ToString("HH:mm"),
            CloseTime = v.ProfileDetail?.CloseTime?.ToString("HH:mm"),
            AverageRating = v.Reviews.Count > 0 ? Math.Round(v.Reviews.Average(r => (double)r.Rating), 1) : 0,
            ReviewCount = v.Reviews.Count,
            FollowerCount = v.Followers.Count + v.VendorFollowers.Count,
            FollowingCount = v.VendorFollowing.Count,
            PostCount = v.Posts.Count,
            IsFollowed = isFollowed,
            CategoryIds = v.SelectedCategories.Select(sc => sc.ItemId).ToList()
        };
    }
}
