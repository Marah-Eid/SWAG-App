using Microsoft.EntityFrameworkCore;
using SwagBackend.Models;

namespace SwagBackend.Data;

public class SwagDbContext : DbContext
{
    public SwagDbContext(DbContextOptions<SwagDbContext> options) : base(options) { }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<VendorDocument> VendorDocuments => Set<VendorDocument>();
    public DbSet<VendorProfileDetail> VendorProfileDetails => Set<VendorProfileDetail>();
    public DbSet<VendorCategorySection> VendorCategorySections => Set<VendorCategorySection>();
    public DbSet<VendorCategoryItem> VendorCategoryItems => Set<VendorCategoryItem>();
    public DbSet<VendorSelectedCategory> VendorSelectedCategories => Set<VendorSelectedCategory>();
    public DbSet<CustomerInterest> CustomerInterests => Set<CustomerInterest>();
    public DbSet<OtpVerification> OtpVerifications => Set<OtpVerification>();
    public DbSet<CustomerCar> CustomerCars => Set<CustomerCar>();
    public DbSet<CarMaintenanceRecord> CarMaintenanceRecords => Set<CarMaintenanceRecord>();
    public DbSet<VendorPost> VendorPosts => Set<VendorPost>();
    public DbSet<PostCategory> PostCategories => Set<PostCategory>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<PostSave> PostSaves => Set<PostSave>();
    public DbSet<PostComment> PostComments => Set<PostComment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<CustomerFollow> CustomerFollows => Set<CustomerFollow>();
    public DbSet<VendorFollow> VendorFollows => Set<VendorFollow>();
    public DbSet<VendorCollection> VendorCollections => Set<VendorCollection>();
    public DbSet<VendorCollectionPost> VendorCollectionPosts => Set<VendorCollectionPost>();
    public DbSet<EventType> EventTypes => Set<EventType>();
    public DbSet<PostEventType> PostEventTypes => Set<PostEventType>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<VendorApprovalLog> VendorApprovalLogs => Set<VendorApprovalLog>();
    public DbSet<DevicePushToken> DevicePushTokens => Set<DevicePushToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Register PostgreSQL enum types (default snake_case translator)
        modelBuilder.HasPostgresEnum<UserRole>("user_role");
        modelBuilder.HasPostgresEnum<VendorStatus>("vendor_status");
        modelBuilder.HasPostgresEnum<OtpPurpose>("otp_purpose");
        modelBuilder.HasPostgresEnum<MessageType>("message_type");
        modelBuilder.HasPostgresEnum<PostType>("post_type");
        modelBuilder.HasPostgresEnum<MediaType>("media_type");
        modelBuilder.HasPostgresEnum<NotificationType>("notification_type");

        // ── VendorSelectedCategory composite PK ─────────────────────
        modelBuilder.Entity<VendorSelectedCategory>()
            .HasKey(x => new { x.VendorId, x.ItemId });

        // ── CustomerInterest composite PK ────────────────────────────
        modelBuilder.Entity<CustomerInterest>()
            .HasKey(x => new { x.CustomerId, x.ItemId });

        // ── PostCategory composite PK ────────────────────────────────
        modelBuilder.Entity<PostCategory>()
            .HasKey(x => new { x.PostId, x.ItemId });

        // ── PostEventType composite PK ───────────────────────────────
        modelBuilder.Entity<PostEventType>()
            .HasKey(x => new { x.PostId, x.EventTypeId });

        // ── VendorCollectionPost composite PK ────────────────────────
        modelBuilder.Entity<VendorCollectionPost>()
            .HasKey(x => new { x.CollectionId, x.PostId });

        // ── CustomerFollow composite PK ──────────────────────────────
        modelBuilder.Entity<CustomerFollow>()
            .HasKey(x => new { x.CustomerId, x.VendorId });

        // ── VendorFollow composite PK ────────────────────────────────
        modelBuilder.Entity<VendorFollow>()
            .HasKey(x => new { x.FollowerId, x.FollowingId });

        // ── PostLike unique index ────────────────────────────────────
        modelBuilder.Entity<PostLike>()
            .HasIndex(x => new { x.PostId, x.LikerId, x.LikerType })
            .IsUnique();

        // ── PostSave unique index ────────────────────────────────────
        modelBuilder.Entity<PostSave>()
            .HasIndex(x => new { x.PostId, x.SaverId, x.SaverType })
            .IsUnique();

        // ── Review unique: one review per customer per vendor ────────
        modelBuilder.Entity<Review>()
            .HasIndex(x => new { x.VendorId, x.CustomerId })
            .IsUnique();

        // ── Conversation unique index ────────────────────────────────
        modelBuilder.Entity<Conversation>()
            .HasIndex(x => new { x.ParticipantOneId, x.ParticipantOneType, x.ParticipantTwoId, x.ParticipantTwoType })
            .IsUnique();

        // ── VendorProfileDetail: 1-to-1 with Vendor ──────────────────
        modelBuilder.Entity<VendorProfileDetail>()
            .HasOne(v => v.Vendor)
            .WithOne(v => v.ProfileDetail)
            .HasForeignKey<VendorProfileDetail>(v => v.VendorId);

        // ── VendorDocument: 1-to-1 with Vendor ───────────────────────
        modelBuilder.Entity<VendorDocument>()
            .HasOne(v => v.Vendor)
            .WithOne(v => v.Document)
            .HasForeignKey<VendorDocument>(v => v.VendorId);

        // ── VendorFollow self-referencing ────────────────────────────
        modelBuilder.Entity<VendorFollow>()
            .HasOne(vf => vf.Follower)
            .WithMany(v => v.VendorFollowing)
            .HasForeignKey(vf => vf.FollowerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VendorFollow>()
            .HasOne(vf => vf.Following)
            .WithMany(v => v.VendorFollowers)
            .HasForeignKey(vf => vf.FollowingId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Enum column type mappings ─────────────────────────────────
        modelBuilder.Entity<Vendor>()
            .Property(v => v.Status)
            .HasColumnType("vendor_status");

        modelBuilder.Entity<OtpVerification>()
            .Property(o => o.Purpose)
            .HasColumnType("otp_purpose");

        modelBuilder.Entity<VendorPost>()
            .Property(p => p.Type)
            .HasColumnType("post_type");

        modelBuilder.Entity<VendorPost>()
            .Property(p => p.MediaType)
            .HasColumnType("media_type");

        modelBuilder.Entity<PostLike>()
            .Property(p => p.LikerType)
            .HasColumnType("user_role");

        modelBuilder.Entity<PostSave>()
            .Property(p => p.SaverType)
            .HasColumnType("user_role");

        modelBuilder.Entity<PostComment>()
            .Property(p => p.CommenterType)
            .HasColumnType("user_role");

        modelBuilder.Entity<Conversation>()
            .Property(c => c.ParticipantOneType)
            .HasColumnType("user_role");

        modelBuilder.Entity<Conversation>()
            .Property(c => c.ParticipantTwoType)
            .HasColumnType("user_role");

        modelBuilder.Entity<ChatMessage>()
            .Property(m => m.SenderType)
            .HasColumnType("user_role");

        modelBuilder.Entity<ChatMessage>()
            .Property(m => m.MessageType)
            .HasColumnType("message_type");

        modelBuilder.Entity<Notification>()
            .Property(n => n.RecipientType)
            .HasColumnType("user_role");

        modelBuilder.Entity<Notification>()
            .Property(n => n.Type)
            .HasColumnType("notification_type");

        modelBuilder.Entity<DevicePushToken>()
            .Property(d => d.UserType)
            .HasColumnType("user_role");

        modelBuilder.Entity<DevicePushToken>()
            .HasIndex(d => new { d.UserId, d.ExpoToken })
            .IsUnique();

        modelBuilder.Entity<VendorApprovalLog>()
            .Property(l => l.Action)
            .HasColumnType("vendor_status");

        // ── VendorCategoryItem unique ─────────────────────────────────
        modelBuilder.Entity<VendorCategoryItem>()
            .HasIndex(x => new { x.SectionId, x.Name })
            .IsUnique();

        // ── Customer: at least one contact constraint is at DB level ─
        // EF Core doesn't enforce CHECK constraints directly, handled in app logic
    }
}
