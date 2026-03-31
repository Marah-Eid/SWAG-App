using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwagBackend.Models;

[Table("vendor_category_sections")]
public class VendorCategorySection
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("name"), MaxLength(100), Required]
    public string Name { get; set; } = string.Empty;

    public ICollection<VendorCategoryItem> Items { get; set; } = new List<VendorCategoryItem>();
}

[Table("vendor_category_items")]
public class VendorCategoryItem
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("section_id"), Required]
    public int SectionId { get; set; }

    [Column("name"), MaxLength(150), Required]
    public string Name { get; set; } = string.Empty;

    [ForeignKey("SectionId")]
    public VendorCategorySection Section { get; set; } = null!;

    public ICollection<VendorSelectedCategory> VendorSelections { get; set; } = new List<VendorSelectedCategory>();
    public ICollection<CustomerInterest> CustomerInterests { get; set; } = new List<CustomerInterest>();
    public ICollection<PostCategory> PostCategories { get; set; } = new List<PostCategory>();
}

[Table("vendor_selected_categories")]
public class VendorSelectedCategory
{
    [Column("vendor_id")]
    public Guid VendorId { get; set; }

    [Column("item_id")]
    public int ItemId { get; set; }

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;

    [ForeignKey("ItemId")]
    public VendorCategoryItem Item { get; set; } = null!;
}

[Table("customer_interests")]
public class CustomerInterest
{
    [Column("customer_id")]
    public Guid CustomerId { get; set; }

    [Column("item_id")]
    public int ItemId { get; set; }

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

    [ForeignKey("ItemId")]
    public VendorCategoryItem Item { get; set; } = null!;
}

[Table("event_types")]
public class EventType
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("name"), MaxLength(100), Required]
    public string Name { get; set; } = string.Empty;

    public ICollection<PostEventType> PostEventTypes { get; set; } = new List<PostEventType>();
}
