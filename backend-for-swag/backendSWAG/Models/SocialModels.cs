using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwagBackend.Models;

[Table("reviews")]
public class Review
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("vendor_id"), Required]
    public Guid VendorId { get; set; }

    [Column("customer_id"), Required]
    public Guid CustomerId { get; set; }

    [Column("rating"), Required]
    public short Rating { get; set; }

    [Column("feedback"), Required]
    public string Feedback { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;
}

[Table("customer_follows")]
public class CustomerFollow
{
    [Column("customer_id")]
    public Guid CustomerId { get; set; }

    [Column("vendor_id")]
    public Guid VendorId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;
}

[Table("vendor_follows")]
public class VendorFollow
{
    [Column("follower_id")]
    public Guid FollowerId { get; set; }

    [Column("following_id")]
    public Guid FollowingId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("FollowerId")]
    public Vendor Follower { get; set; } = null!;

    [ForeignKey("FollowingId")]
    public Vendor Following { get; set; } = null!;
}
