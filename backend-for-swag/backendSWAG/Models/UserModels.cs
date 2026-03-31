using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwagBackend.Models;

[Table("admins")]
public class Admin
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("email"), MaxLength(255), Required]
    public string Email { get; set; } = string.Empty;

    [Column("password_hash"), Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<VendorApprovalLog> ApprovalLogs { get; set; } = new List<VendorApprovalLog>();
}

[Table("customers")]
public class Customer
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("full_name"), MaxLength(150), Required]
    public string FullName { get; set; } = string.Empty;

    [Column("email"), MaxLength(255)]
    public string? Email { get; set; }

    [Column("phone"), MaxLength(30)]
    public string? Phone { get; set; }

    [Column("password_hash"), Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("city"), MaxLength(100)]
    public string? City { get; set; }

    [Column("profile_image")]
    public string? ProfileImage { get; set; }

    [Column("banner_image")]
    public string? BannerImage { get; set; }

    [Column("language"), MaxLength(10)]
    public string Language { get; set; } = "en";

    [Column("dark_mode")]
    public bool DarkMode { get; set; } = false;

    [Column("push_notifications")]
    public bool PushNotifications { get; set; } = true;

    [Column("is_verified")]
    public bool IsVerified { get; set; } = false;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CustomerInterest> Interests { get; set; } = new List<CustomerInterest>();
    public ICollection<CustomerCar> Cars { get; set; } = new List<CustomerCar>();
    public ICollection<CustomerFollow> Following { get; set; } = new List<CustomerFollow>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

[Table("vendors")]
public class Vendor
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("full_name"), MaxLength(150), Required]
    public string FullName { get; set; } = string.Empty;

    [Column("shop_name"), MaxLength(200), Required]
    public string ShopName { get; set; } = string.Empty;

    [Column("shop_type"), MaxLength(150), Required]
    public string ShopType { get; set; } = string.Empty;

    [Column("email"), MaxLength(255)]
    public string? Email { get; set; }

    [Column("phone"), MaxLength(30)]
    public string? Phone { get; set; }

    [Column("password_hash"), Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("city"), MaxLength(100)]
    public string? City { get; set; }

    [Column("location_url")]
    public string? LocationUrl { get; set; }

    [Column("location_lat")]
    public decimal? LocationLat { get; set; }

    [Column("location_lng")]
    public decimal? LocationLng { get; set; }

    [Column("commercial_reg_number"), MaxLength(100)]
    public string? CommercialRegNumber { get; set; }

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("profile_image")]
    public string? ProfileImage { get; set; }

    [Column("banner_image")]
    public string? BannerImage { get; set; }

    [Column("status")]
    public VendorStatus Status { get; set; } = VendorStatus.Pending;

    [Column("language"), MaxLength(10)]
    public string Language { get; set; } = "en";

    [Column("dark_mode")]
    public bool DarkMode { get; set; } = false;

    [Column("push_notifications")]
    public bool PushNotifications { get; set; } = true;

    [Column("is_verified")]
    public bool IsVerified { get; set; } = false;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public VendorDocument? Document { get; set; }
    public VendorProfileDetail? ProfileDetail { get; set; }
    public ICollection<VendorSelectedCategory> SelectedCategories { get; set; } = new List<VendorSelectedCategory>();
    public ICollection<VendorPost> Posts { get; set; } = new List<VendorPost>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<CustomerFollow> Followers { get; set; } = new List<CustomerFollow>();
    public ICollection<VendorFollow> VendorFollowers { get; set; } = new List<VendorFollow>();
    public ICollection<VendorFollow> VendorFollowing { get; set; } = new List<VendorFollow>();
    public ICollection<VendorCollection> Collections { get; set; } = new List<VendorCollection>();
    public ICollection<VendorApprovalLog> ApprovalLogs { get; set; } = new List<VendorApprovalLog>();
}

[Table("vendor_documents")]
public class VendorDocument
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("vendor_id"), Required]
    public Guid VendorId { get; set; }

    [Column("license_file")]
    public string? LicenseFile { get; set; }

    [Column("id_front_file")]
    public string? IdFrontFile { get; set; }

    [Column("id_back_file")]
    public string? IdBackFile { get; set; }

    [Column("uploaded_at")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;
}

[Table("vendor_profile_details")]
public class VendorProfileDetail
{
    [Key, Column("vendor_id")]
    public Guid VendorId { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("whatsapp"), MaxLength(30)]
    public string? Whatsapp { get; set; }

    [Column("instagram_url")]
    public string? InstagramUrl { get; set; }

    [Column("open_time")]
    public TimeOnly? OpenTime { get; set; }

    [Column("close_time")]
    public TimeOnly? CloseTime { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;
}

[Table("otp_verifications")]
public class OtpVerification
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("recipient"), MaxLength(255), Required]
    public string Recipient { get; set; } = string.Empty;

    [Column("code"), MaxLength(10), Required]
    public string Code { get; set; } = string.Empty;

    [Column("purpose")]
    public OtpPurpose Purpose { get; set; }

    [Column("is_used")]
    public bool IsUsed { get; set; } = false;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
