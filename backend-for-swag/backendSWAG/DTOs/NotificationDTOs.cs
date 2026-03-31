namespace SwagBackend.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? DeepLink { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminVendorDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public string ShopType { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? City { get; set; }
    public string? LocationUrl { get; set; }
    public string? CommercialRegNumber { get; set; }
    public string? ProfileImage { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
    // Documents
    public string? LicenseFile { get; set; }
    public string? IdFrontFile { get; set; }
    public string? IdBackFile { get; set; }
}

public class VendorActionRequest
{
    public string? Reason { get; set; }
}
