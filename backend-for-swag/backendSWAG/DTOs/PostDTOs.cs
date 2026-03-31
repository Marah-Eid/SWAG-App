namespace SwagBackend.DTOs;

public class PostDto
{
    public Guid Id { get; set; }
    public Guid VendorId { get; set; }
    public string VendorShopName { get; set; } = string.Empty;
    public string? VendorProfileImage { get; set; }
    public string? Description { get; set; }
    public string? PostImage { get; set; }
    public string MediaType { get; set; } = "image";
    public int? MediaWidth { get; set; }
    public int? MediaHeight { get; set; }
    public string Type { get; set; } = "post";
    public string? EventTitle { get; set; }
    public string? EventDate { get; set; }
    public string? EventTime { get; set; }
    public string? EventEndTime { get; set; }
    public string? Location { get; set; }
    public DateTime CreatedAt { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int SaveCount { get; set; }
    public bool IsLiked { get; set; }
    public bool IsSaved { get; set; }
    public List<int> CategoryIds { get; set; } = new();
    public List<int> EventTypeIds { get; set; } = new();
}

public class CreatePostRequest
{
    public string? Description { get; set; }
    public string? PostImage { get; set; }
    public string MediaType { get; set; } = "image";
    public int? MediaWidth { get; set; }
    public int? MediaHeight { get; set; }
    public string Type { get; set; } = "post";
    public string? EventTitle { get; set; }
    public string? EventDate { get; set; }
    public string? EventTime { get; set; }
    public string? EventEndTime { get; set; }
    public string? Location { get; set; }
    public List<int> CategoryIds { get; set; } = new();
    public List<int> EventTypeIds { get; set; } = new();
}

public class UpdatePostRequest
{
    public string? Description { get; set; }
    public string? PostImage { get; set; }
    public string? EventTitle { get; set; }
    public string? EventDate { get; set; }
    public string? EventTime { get; set; }
    public string? EventEndTime { get; set; }
    public string? Location { get; set; }
    public List<int>? CategoryIds { get; set; }
    public List<int>? EventTypeIds { get; set; }
}

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Guid CommenterId { get; set; }
    public string CommenterType { get; set; } = string.Empty;
    public string CommenterName { get; set; } = string.Empty;
    public string? CommenterImage { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AddCommentRequest
{
    public string CommentText { get; set; } = string.Empty;
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid VendorId { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerImage { get; set; }
    public int Rating { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AddReviewRequest
{
    public Guid VendorId { get; set; }
    public int Rating { get; set; }
    public string Feedback { get; set; } = string.Empty;
}

public class CategorySectionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<CategoryItemDto> Items { get; set; } = new();
}

public class CategoryItemDto
{
    public int Id { get; set; }
    public int SectionId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class EventTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class MyCommentDto
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string? VendorLogo { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
