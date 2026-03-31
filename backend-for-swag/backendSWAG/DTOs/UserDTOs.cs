namespace SwagBackend.DTOs;

// ─── CUSTOMER DTOs ───────────────────────────────────────────────────────────

public class CustomerProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? City { get; set; }
    public string? ProfileImage { get; set; }
    public string? BannerImage { get; set; }
    public string Language { get; set; } = "en";
    public bool DarkMode { get; set; }
    public bool PushNotifications { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<int> InterestIds { get; set; } = new();
}

public class UpdateCustomerRequest
{
    public string? FullName { get; set; }
    public string? City { get; set; }
    public string? ProfileImage { get; set; }
    public string? BannerImage { get; set; }
    public string? Language { get; set; }
    public bool? DarkMode { get; set; }
    public bool? PushNotifications { get; set; }
}

public class SetInterestsRequest
{
    public List<int> ItemIds { get; set; } = new();
}

// ─── VENDOR DTOs ─────────────────────────────────────────────────────────────

public class VendorSummaryDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public string ShopType { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? ProfileImage { get; set; }
    public string? BannerImage { get; set; }
    public string? Bio { get; set; }
    public string Status { get; set; } = "pending";
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int FollowerCount { get; set; }
    public bool IsFollowed { get; set; }
}

public class VendorProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public string ShopType { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? City { get; set; }
    public string? LocationUrl { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLng { get; set; }
    public string? CommercialRegNumber { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImage { get; set; }
    public string? BannerImage { get; set; }
    public string Status { get; set; } = "pending";
    public string Language { get; set; } = "en";
    public bool DarkMode { get; set; }
    public bool PushNotifications { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    // Profile details
    public string? Address { get; set; }
    public string? Whatsapp { get; set; }
    public string? InstagramUrl { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
    // Stats
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int FollowerCount { get; set; }
    public int PostCount { get; set; }
    public bool IsFollowed { get; set; }
    // Selected categories
    public List<int> CategoryIds { get; set; } = new();
}

public class UpdateVendorRequest
{
    public string? FullName { get; set; }
    public string? ShopName { get; set; }
    public string? ShopType { get; set; }
    public string? City { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImage { get; set; }
    public string? BannerImage { get; set; }
    public string? LocationUrl { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLng { get; set; }
    public string? CommercialRegNumber { get; set; }
    public string? Language { get; set; }
    public bool? DarkMode { get; set; }
    public bool? PushNotifications { get; set; }
}

public class UpdateVendorProfileDetailRequest
{
    public string? Address { get; set; }
    public string? Whatsapp { get; set; }
    public string? InstagramUrl { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
}

public class SetVendorCategoriesRequest
{
    public List<int> ItemIds { get; set; } = new();
}

public class AddVendorCategoryRequest
{
    public int ItemId { get; set; }
}

public class VendorCollectionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PostCount { get; set; }
}

public class CreateCollectionRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
