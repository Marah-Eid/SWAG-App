using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IOtpService _otpService;
    private readonly ICurrentUserService _currentUser;

    public AuthController(SwagDbContext db, ITokenService tokenService, IOtpService otpService, ICurrentUserService currentUser)
    {
        _db = db;
        _tokenService = tokenService;
        _otpService = otpService;
        _currentUser = currentUser;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FullName) ||
            string.IsNullOrWhiteSpace(req.EmailOrPhone) ||
            string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Full name, contact, and password are required." });

        if (req.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        bool isEmail = req.EmailOrPhone.Contains('@');
        string? email = isEmail ? req.EmailOrPhone.Trim().ToLower() : null;
        string? phone = isEmail ? null : req.EmailOrPhone.Trim();

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        if (req.Role == "Customer")
        {
            // Check duplicate
            if (email != null && await _db.Customers.AnyAsync(c => c.Email == email))
                return Conflict(new { message = "An account with this email already exists." });
            if (phone != null && await _db.Customers.AnyAsync(c => c.Phone == phone))
                return Conflict(new { message = "An account with this phone already exists." });

            var customer = new Customer
            {
                FullName = req.FullName.Trim(),
                Email = email,
                Phone = phone,
                PasswordHash = passwordHash,
                City = req.City?.Trim()
            };

            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();

            var token = _tokenService.GenerateToken(customer.Id, "Customer", email);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapCustomerToDto(customer)
            });
        }
        else if (req.Role == "Vendor")
        {
            if (string.IsNullOrWhiteSpace(req.ShopName))
                return BadRequest(new { message = "Shop name is required for vendor registration." });

            // Check duplicate
            if (email != null && await _db.Vendors.AnyAsync(v => v.Email == email))
                return Conflict(new { message = "An account with this email already exists." });
            if (phone != null && await _db.Vendors.AnyAsync(v => v.Phone == phone))
                return Conflict(new { message = "An account with this phone already exists." });

            var vendor = new Vendor
            {
                FullName = req.FullName.Trim(),
                ShopName = req.ShopName.Trim(),
                ShopType = req.ShopType?.Trim() ?? "General",
                Email = email,
                Phone = phone,
                PasswordHash = passwordHash,
                City = req.City?.Trim(),
                LocationUrl = req.LocationUrl,
                LocationLat = req.LocationLat,
                LocationLng = req.LocationLng,
                CommercialRegNumber = req.CommercialRegNumber,
                Status = VendorStatus.Pending
            };

            _db.Vendors.Add(vendor);
            await _db.SaveChangesAsync();

            // Save vendor documents if provided
            if (req.LicenseFile != null || req.IdFrontFile != null || req.IdBackFile != null)
            {
                _db.VendorDocuments.Add(new VendorDocument
                {
                    VendorId = vendor.Id,
                    LicenseFile = req.LicenseFile,
                    IdFrontFile = req.IdFrontFile,
                    IdBackFile = req.IdBackFile
                });
                await _db.SaveChangesAsync();
            }

            // Link selected category names to vendor
            // The frontend sends human-readable strings (e.g. "Car-Parts", "Tuning (Mechanical/Cosmetic)").
            // We match each string against section names using a case-insensitive "contains" check,
            // then link the vendor to all items in every matched section.
            if (req.CategoryNames != null && req.CategoryNames.Count > 0)
            {
                var allSections = await _db.VendorCategorySections
                    .Include(s => s.Items)
                    .ToListAsync();

                var seenItemIds = new HashSet<int>();

                foreach (var rawName in req.CategoryNames.Distinct())
                {
                    var cleaned = rawName.Trim().ToLower();

                    // Find sections whose name appears inside the selected string
                    // (e.g. "Gas Station" is inside "Gas Station (Fuel & Energy)")
                    var matchedSections = allSections
                        .Where(s => cleaned.Contains(s.Name.ToLower()))
                        .ToList();

                    // Fallback: the selected string appears inside the section name
                    // (e.g. "Car-Parts" → "Car Parts" after normalisation)
                    if (matchedSections.Count == 0)
                    {
                        var normalised = cleaned.Replace("-", " ");
                        matchedSections = allSections
                            .Where(s => s.Name.ToLower().Contains(normalised))
                            .ToList();
                    }

                    foreach (var section in matchedSections)
                    {
                        foreach (var item in section.Items)
                        {
                            if (seenItemIds.Add(item.Id))
                            {
                                _db.VendorSelectedCategories.Add(new VendorSelectedCategory
                                {
                                    VendorId = vendor.Id,
                                    ItemId = item.Id
                                });
                            }
                        }
                    }
                }

                if (seenItemIds.Count > 0)
                    await _db.SaveChangesAsync();
            }

            var token = _tokenService.GenerateToken(vendor.Id, "Vendor", email);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapVendorToDto(vendor)
            });
        }

        return BadRequest(new { message = "Invalid role. Must be Customer or Vendor." });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.EmailOrPhone) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Contact and password are required." });

        bool isEmail = req.EmailOrPhone.Contains('@');
        string contact = req.EmailOrPhone.Trim().ToLower();

        if (req.Role == "Admin")
        {
            var admin = isEmail
                ? await _db.Admins.FirstOrDefaultAsync(a => a.Email == contact)
                : null;

            if (admin == null || !BCrypt.Net.BCrypt.Verify(req.Password, admin.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            var token = _tokenService.GenerateToken(admin.Id, "Admin", admin.Email);
            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    FirstName = "Admin",
                    FullName = "Admin",
                    Role = "Admin"
                }
            });
        }
        else if (req.Role == "Customer")
        {
            Customer? customer = isEmail
                ? await _db.Customers.FirstOrDefaultAsync(c => c.Email == contact && !c.IsDeleted)
                : await _db.Customers.FirstOrDefaultAsync(c => c.Phone == req.EmailOrPhone.Trim() && !c.IsDeleted);

            if (customer == null || !BCrypt.Net.BCrypt.Verify(req.Password, customer.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            var token = _tokenService.GenerateToken(customer.Id, "Customer", customer.Email);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapCustomerToDto(customer)
            });
        }
        else if (req.Role == "Vendor")
        {
            Vendor? vendor = isEmail
                ? await _db.Vendors.FirstOrDefaultAsync(v => v.Email == contact && !v.IsDeleted)
                : await _db.Vendors.FirstOrDefaultAsync(v => v.Phone == req.EmailOrPhone.Trim() && !v.IsDeleted);

            if (vendor == null || !BCrypt.Net.BCrypt.Verify(req.Password, vendor.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            var token = _tokenService.GenerateToken(vendor.Id, "Vendor", vendor.Email);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapVendorToDto(vendor)
            });
        }

        return BadRequest(new { message = "Invalid role." });
    }

    // POST /api/auth/send-otp
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Recipient))
            return BadRequest(new { message = "Recipient is required." });

        var purpose = req.Purpose switch
        {
            "forgot_password" => OtpPurpose.ForgotPassword,
            "change_contact" => OtpPurpose.ChangeContact,
            _ => OtpPurpose.Signup
        };

        await _otpService.GenerateAndSendAsync(req.Recipient.Trim(), purpose);

        return Ok(new MessageResponse { Message = "OTP sent successfully." });
    }

    // POST /api/auth/verify-otp
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Recipient) || string.IsNullOrWhiteSpace(req.Code))
            return BadRequest(new { message = "Recipient and code are required." });

        var purpose = req.Purpose switch
        {
            "forgot_password" => OtpPurpose.ForgotPassword,
            "change_contact" => OtpPurpose.ChangeContact,
            _ => OtpPurpose.Signup
        };

        // For forgot_password, don't consume the OTP here — ResetPassword will consume it
        bool consumeNow = purpose != OtpPurpose.ForgotPassword;
        bool valid = await _otpService.VerifyAsync(req.Recipient.Trim(), req.Code.Trim(), purpose, consumeNow);

        if (!valid)
            return BadRequest(new { message = "Invalid or expired code." });

        // Mark contact as verified if it's signup
        if (purpose == OtpPurpose.Signup)
        {
            bool isEmail = req.Recipient.Contains('@');
            if (isEmail)
            {
                var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email == req.Recipient.Trim().ToLower());
                if (customer != null) { customer.IsVerified = true; await _db.SaveChangesAsync(); }

                var vendor = await _db.Vendors.FirstOrDefaultAsync(v => v.Email == req.Recipient.Trim().ToLower());
                if (vendor != null) { vendor.IsVerified = true; await _db.SaveChangesAsync(); }
            }
            else
            {
                var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Phone == req.Recipient.Trim());
                if (customer != null) { customer.IsVerified = true; await _db.SaveChangesAsync(); }
            }
        }

        return Ok(new MessageResponse { Message = "Code verified successfully." });
    }

    // POST /api/auth/forgot-password
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.EmailOrPhone))
            return BadRequest(new { message = "Email or phone is required." });

        bool isEmail = req.EmailOrPhone.Contains('@');
        string contact = req.EmailOrPhone.Trim();

        bool exists = false;
        if (req.Role == "Customer")
            exists = isEmail
                ? await _db.Customers.AnyAsync(c => c.Email == contact.ToLower() && !c.IsDeleted)
                : await _db.Customers.AnyAsync(c => c.Phone == contact && !c.IsDeleted);
        else if (req.Role == "Vendor")
            exists = isEmail
                ? await _db.Vendors.AnyAsync(v => v.Email == contact.ToLower() && !v.IsDeleted)
                : await _db.Vendors.AnyAsync(v => v.Phone == contact && !v.IsDeleted);

        if (!exists)
            return NotFound(new { message = "No account found with this contact." });

        await _otpService.GenerateAndSendAsync(contact, OtpPurpose.ForgotPassword);
        return Ok(new MessageResponse { Message = "Reset code sent successfully." });
    }

    // POST /api/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Code) || string.IsNullOrWhiteSpace(req.NewPassword))
            return BadRequest(new { message = "Code and new password are required." });

        if (req.NewPassword.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        bool valid = await _otpService.VerifyAsync(
            req.EmailOrPhone.Trim(), req.Code.Trim(), OtpPurpose.ForgotPassword);

        if (!valid)
            return BadRequest(new { message = "Invalid or expired code." });

        string newHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        bool isEmail = req.EmailOrPhone.Contains('@');
        string contact = req.EmailOrPhone.Trim();

        if (req.Role == "Customer")
        {
            var customer = isEmail
                ? await _db.Customers.FirstOrDefaultAsync(c => c.Email == contact.ToLower() && !c.IsDeleted)
                : await _db.Customers.FirstOrDefaultAsync(c => c.Phone == contact && !c.IsDeleted);

            if (customer == null) return NotFound(new { message = "Account not found." });
            customer.PasswordHash = newHash;
            customer.UpdatedAt = DateTime.UtcNow;
        }
        else if (req.Role == "Vendor")
        {
            var vendor = isEmail
                ? await _db.Vendors.FirstOrDefaultAsync(v => v.Email == contact.ToLower() && !v.IsDeleted)
                : await _db.Vendors.FirstOrDefaultAsync(v => v.Phone == contact && !v.IsDeleted);

            if (vendor == null) return NotFound(new { message = "Account not found." });
            vendor.PasswordHash = newHash;
            vendor.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Password reset successfully." });
    }

    // PUT /api/auth/change-password
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.CurrentPassword) || string.IsNullOrWhiteSpace(req.NewPassword))
            return BadRequest(new { message = "Current and new password are required." });

        if (req.NewPassword.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        var myId = _currentUser.UserId;
        var myRole = _currentUser.Role;

        if (myRole == "Customer")
        {
            var customer = await _db.Customers.FindAsync(myId);
            if (customer == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, customer.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            customer.UpdatedAt = DateTime.UtcNow;
        }
        else if (myRole == "Vendor")
        {
            var vendor = await _db.Vendors.FindAsync(myId);
            if (vendor == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, vendor.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            vendor.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            vendor.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            return Forbid();
        }

        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Password changed successfully." });
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private static UserDto MapCustomerToDto(Customer c) => new()
    {
        Id = c.Id,
        Email = c.Email ?? string.Empty,
        Phone = c.Phone,
        FirstName = c.FullName.Split(' ')[0],
        FullName = c.FullName,
        Role = "Customer",
        City = c.City,
        ProfileImage = c.ProfileImage
    };

    // PUT /api/auth/heartbeat  — updates LastSeenAt for the current user
    [HttpPut("heartbeat")]
    [Authorize]
    public async Task<IActionResult> Heartbeat()
    {
        var myId = _currentUser.UserId;
        var role = _currentUser.Role;

        if (role == "Customer")
        {
            var customer = await _db.Customers.FindAsync(myId);
            if (customer != null)
            {
                customer.LastSeenAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
        else if (role == "Vendor")
        {
            var vendor = await _db.Vendors.FindAsync(myId);
            if (vendor != null)
            {
                vendor.LastSeenAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        return Ok();
    }

    private static UserDto MapVendorToDto(Vendor v) => new()
    {
        Id = v.Id,
        Email = v.Email ?? string.Empty,
        Phone = v.Phone,
        FirstName = v.FullName.Split(' ')[0],
        FullName = v.FullName,
        Role = "Vendor",
        Status = v.Status.ToString().ToLower(),
        City = v.City,
        ProfileImage = v.ProfileImage,
        ShopName = v.ShopName
    };
}
