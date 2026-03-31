using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwagBackend.Models;

[Table("vendor_posts")]
public class VendorPost
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("vendor_id"), Required]
    public Guid VendorId { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("post_image")]
    public string? PostImage { get; set; }

    [Column("media_type")]
    public MediaType MediaType { get; set; } = MediaType.Image;

    [Column("media_width")]
    public int? MediaWidth { get; set; }

    [Column("media_height")]
    public int? MediaHeight { get; set; }

    [Column("type")]
    public PostType Type { get; set; } = PostType.Post;

    [Column("event_title"), MaxLength(200)]
    public string? EventTitle { get; set; }

    [Column("event_date"), MaxLength(50)]
    public string? EventDate { get; set; }

    [Column("event_time"), MaxLength(50)]
    public string? EventTime { get; set; }

    [Column("event_end_time"), MaxLength(50)]
    public string? EventEndTime { get; set; }

    [Column("location"), MaxLength(200)]
    public string? Location { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;

    public ICollection<PostCategory> Categories { get; set; } = new List<PostCategory>();
    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    public ICollection<PostSave> Saves { get; set; } = new List<PostSave>();
    public ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
    public ICollection<PostEventType> EventTypes { get; set; } = new List<PostEventType>();
    public ICollection<VendorCollectionPost> CollectionPosts { get; set; } = new List<VendorCollectionPost>();
}

[Table("post_categories")]
public class PostCategory
{
    [Column("post_id")]
    public Guid PostId { get; set; }

    [Column("item_id")]
    public int ItemId { get; set; }

    [ForeignKey("PostId")]
    public VendorPost Post { get; set; } = null!;

    [ForeignKey("ItemId")]
    public VendorCategoryItem Item { get; set; } = null!;
}

[Table("post_likes")]
public class PostLike
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("post_id"), Required]
    public Guid PostId { get; set; }

    [Column("liker_id"), Required]
    public Guid LikerId { get; set; }

    [Column("liker_type")]
    public UserRole LikerType { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("PostId")]
    public VendorPost Post { get; set; } = null!;
}

[Table("post_saves")]
public class PostSave
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("post_id"), Required]
    public Guid PostId { get; set; }

    [Column("saver_id"), Required]
    public Guid SaverId { get; set; }

    [Column("saver_type")]
    public UserRole SaverType { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("PostId")]
    public VendorPost Post { get; set; } = null!;
}

[Table("post_comments")]
public class PostComment
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("post_id"), Required]
    public Guid PostId { get; set; }

    [Column("commenter_id"), Required]
    public Guid CommenterId { get; set; }

    [Column("commenter_type")]
    public UserRole CommenterType { get; set; }

    [Column("comment_text"), Required]
    public string CommentText { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("PostId")]
    public VendorPost Post { get; set; } = null!;
}

[Table("post_event_types")]
public class PostEventType
{
    [Column("post_id")]
    public Guid PostId { get; set; }

    [Column("event_type_id")]
    public int EventTypeId { get; set; }

    [ForeignKey("PostId")]
    public VendorPost Post { get; set; } = null!;

    [ForeignKey("EventTypeId")]
    public EventType EventType { get; set; } = null!;
}

[Table("vendor_collections")]
public class VendorCollection
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("vendor_id"), Required]
    public Guid VendorId { get; set; }

    [Column("name"), MaxLength(100), Required]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("VendorId")]
    public Vendor Vendor { get; set; } = null!;

    public ICollection<VendorCollectionPost> Posts { get; set; } = new List<VendorCollectionPost>();
}

[Table("vendor_collection_posts")]
public class VendorCollectionPost
{
    [Column("collection_id")]
    public Guid CollectionId { get; set; }

    [Column("post_id")]
    public Guid PostId { get; set; }

    [ForeignKey("CollectionId")]
    public VendorCollection Collection { get; set; } = null!;

    [ForeignKey("PostId")]
    public VendorPost Post { get; set; } = null!;
}
