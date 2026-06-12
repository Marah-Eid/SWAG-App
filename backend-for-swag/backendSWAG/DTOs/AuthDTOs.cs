namespace SwagBackend.DTOs;

// ─── REQUESTS ───────────────────────────────────────────────────────────────

public class LoginRequest
{
    public string EmailOrPhone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // Customer | Vendor | Admin
}

public class RegisterCustomerRequest
{
    public string FullName { get; set; } = string.Empty;
    public string EmailOrPhone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? City { get; set; }
}

public class RegisterVendorRequest
{
    public string FullName { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public string ShopType { get; set; } = string.Empty;
    public string EmailOrPhone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? LocationUrl { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLng { get; set; }
    public string? CommercialRegNumber { get; set; }
    public string? LicenseFile { get; set; }
    public string? IdFrontFile { get; set; }
    public string? IdBackFile { get; set; }
}

public class RegisterRequest
{
    public string Role { get; set; } = "Customer"; // Customer | Vendor
    // Customer fields
    public string FullName { get; set; } = string.Empty;
    public string EmailOrPhone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? City { get; set; }
    // Vendor-specific fields
    public string? ShopName { get; set; }
    public string? ShopType { get; set; }
    public string? LocationUrl { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLng { get; set; }
    public string? CommercialRegNumber { get; set; }
    public string? LicenseFile { get; set; }
    public string? IdFrontFile { get; set; }
    public string? IdBackFile { get; set; }
    // Category names selected during registration (e.g. ["Car-Parts","Tuning (Mechanical/Cosmetic)"])
    public List<string>? CategoryNames { get; set; }
}

public class SendOtpRequest
{
    public string Recipient { get; set; } = string.Empty; // email or phone
    public string Purpose { get; set; } = "signup"; // signup | forgot_password | change_contact
}

public class VerifyOtpRequest
{
    public string Recipient { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Purpose { get; set; } = "signup";
}

public class ForgotPasswordRequest
{
    public string EmailOrPhone { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer";
}

public class ResetPasswordRequest
{
    public string EmailOrPhone { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer";
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ChangeContactRequest
{
    public string NewContact { get; set; } = string.Empty; // new email or phone
    public string Code { get; set; } = string.Empty;       // OTP
}

// ─── RESPONSES ──────────────────────────────────────────────────────────────

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Status { get; set; } // for vendors: pending | active | rejected
    public string? City { get; set; }
    public string? ProfileImage { get; set; }
    public string? ShopName { get; set; } // vendors only
}

public class MessageResponse
{
    public string Message { get; set; } = string.Empty;
    public bool Success { get; set; } = true;
}
