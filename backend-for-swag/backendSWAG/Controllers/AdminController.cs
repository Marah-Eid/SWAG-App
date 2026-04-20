using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifier;

    public AdminController(SwagDbContext db, ICurrentUserService currentUser, INotificationService notifier)
    {
        _db = db;
        _currentUser = currentUser;
        _notifier = notifier;
    }

    // GET /api/admin/vendors/pending
    [HttpGet("vendors/pending")]
    public async Task<IActionResult> GetPendingVendors()
    {
        var vendors = await _db.Vendors
            .Include(v => v.Document)
            .Where(v => v.Status == VendorStatus.Pending && !v.IsDeleted)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        return Ok(vendors.Select(MapAdminVendor));
    }

    // GET /api/admin/vendors
    [HttpGet("vendors")]
    public async Task<IActionResult> GetAllVendors(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Vendors
            .Include(v => v.Document)
            .Where(v => !v.IsDeleted);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<VendorStatus>(status, true, out var s))
            query = query.Where(v => v.Status == s);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(v =>
                v.ShopName.ToLower().Contains(search.ToLower()) ||
                v.FullName.ToLower().Contains(search.ToLower()));

        var vendors = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(vendors.Select(MapAdminVendor));
    }

    // GET /api/admin/vendors/{id}
    [HttpGet("vendors/{id:guid}")]
    public async Task<IActionResult> GetVendorById(Guid id)
    {
        var vendor = await _db.Vendors
            .Include(v => v.Document)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vendor == null) return NotFound();
        return Ok(MapAdminVendor(vendor));
    }

    // PUT /api/admin/vendors/{id}/approve
    [HttpPut("vendors/{id:guid}/approve")]
    public async Task<IActionResult> ApproveVendor(Guid id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();

        if (vendor.Status == VendorStatus.Active)
            return Ok(new MessageResponse { Message = "Vendor is already active." });

        vendor.Status = VendorStatus.Active;
        vendor.UpdatedAt = DateTime.UtcNow;

        _db.VendorApprovalLogs.Add(new VendorApprovalLog
        {
            VendorId = id,
            AdminId = _currentUser.UserId,
            Action = VendorStatus.Active
        });

        await _db.SaveChangesAsync();

        await _notifier.SendAsync(id, UserRole.Vendor, NotificationType.AccountStatus,
            "Account Approved",
            "Congratulations! Your vendor account has been approved. You can now start posting.");

        return Ok(new MessageResponse { Message = "Vendor approved successfully." });
    }

    // PUT /api/admin/vendors/{id}/reject
    [HttpPut("vendors/{id:guid}/reject")]
    public async Task<IActionResult> RejectVendor(Guid id, [FromBody] VendorActionRequest? req = null)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();

        vendor.Status = VendorStatus.Rejected;
        vendor.UpdatedAt = DateTime.UtcNow;

        _db.VendorApprovalLogs.Add(new VendorApprovalLog
        {
            VendorId = id,
            AdminId = _currentUser.UserId,
            Action = VendorStatus.Rejected
        });

        string reason = req?.Reason ?? "Your application did not meet our requirements.";

        await _db.SaveChangesAsync();

        await _notifier.SendAsync(id, UserRole.Vendor, NotificationType.AccountStatus,
            "Application Rejected", reason);

        return Ok(new MessageResponse { Message = "Vendor rejected." });
    }

    // GET /api/admin/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = new
        {
            totalCustomers = await _db.Customers.CountAsync(c => !c.IsDeleted),
            totalVendors = await _db.Vendors.CountAsync(v => !v.IsDeleted),
            pendingVendors = await _db.Vendors.CountAsync(v => v.Status == VendorStatus.Pending && !v.IsDeleted),
            activeVendors = await _db.Vendors.CountAsync(v => v.Status == VendorStatus.Active && !v.IsDeleted),
            rejectedVendors = await _db.Vendors.CountAsync(v => v.Status == VendorStatus.Rejected && !v.IsDeleted),
            totalPosts = await _db.VendorPosts.CountAsync(),
            totalReviews = await _db.Reviews.CountAsync()
        };

        return Ok(stats);
    }

    private static AdminDto MapAdminVendor(Vendor v) => new()
    {
        Id = v.Id,
        FullName = v.FullName,
        ShopName = v.ShopName,
        ShopType = v.ShopType,
        Email = v.Email,
        Phone = v.Phone,
        City = v.City,
        LocationUrl = v.LocationUrl,
        CommercialRegNumber = v.CommercialRegNumber,
        ProfileImage = v.ProfileImage,
        Status = v.Status.ToString().ToLower(),
        CreatedAt = v.CreatedAt,
        LicenseFile = v.Document?.LicenseFile,
        IdFrontFile = v.Document?.IdFrontFile,
        IdBackFile = v.Document?.IdBackFile
    };
}
