namespace SwagBackend.Models;

public enum UserRole
{
    Customer,
    Vendor,
    Admin
}

public enum VendorStatus
{
    Pending,
    Active,
    Rejected
}

public enum OtpPurpose
{
    Signup,
    ForgotPassword,
    ChangeContact
}

public enum MessageType
{
    Text,
    Image,
    Video
}

public enum PostType
{
    Post,
    Event
}

public enum MediaType
{
    Image,
    Video
}

public enum NotificationType
{
    MaintenanceAlert,
    VendorPost,
    InsuranceExpiry,
    NewEvent,
    Mention,
    NearbySuggestion,
    SystemAlert,
    AccountStatus,
    NewReview,
    NewFollower,
    EventUpdate,
    InventoryTip
}
