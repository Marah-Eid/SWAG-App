using SendGrid;
using SendGrid.Helpers.Mail;
using SwagBackend.Data;
using SwagBackend.Models;

namespace SwagBackend.Services;

public interface IOtpService
{
    Task<string> GenerateAndSendAsync(string recipient, OtpPurpose purpose);
    Task<bool> VerifyAsync(string recipient, string code, OtpPurpose purpose);
}

public class OtpService : IOtpService
{
    private readonly SwagDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<OtpService> _logger;

    public OtpService(SwagDbContext db, IConfiguration config, ILogger<OtpService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<string> GenerateAndSendAsync(string recipient, OtpPurpose purpose)
    {
        // Invalidate any previous unused OTPs for this recipient/purpose
        var old = _db.OtpVerifications
            .Where(o => o.Recipient == recipient && o.Purpose == purpose && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow);
        _db.OtpVerifications.RemoveRange(old);

        // Generate 5-digit code
        var code = Random.Shared.Next(10000, 99999).ToString();

        var otp = new OtpVerification
        {
            Recipient = recipient,
            Code = code,
            Purpose = purpose,
            IsUsed = false,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        };

        _db.OtpVerifications.Add(otp);
        await _db.SaveChangesAsync();

        // Send via SendGrid (email only) or log to console as fallback
        var apiKey = _config["SendGrid:ApiKey"];
        if (!string.IsNullOrEmpty(apiKey) && recipient.Contains('@'))
        {
            await SendEmailOtpAsync(recipient, code, purpose, apiKey);
        }
        else
        {
            // Development fallback — log the OTP
            _logger.LogInformation("OTP for {Recipient} ({Purpose}): {Code}", recipient, purpose, code);
        }

        return code;
    }

    public async Task<bool> VerifyAsync(string recipient, string code, OtpPurpose purpose)
    {
        var otp = _db.OtpVerifications
            .Where(o =>
                o.Recipient == recipient &&
                o.Code == code &&
                o.Purpose == purpose &&
                !o.IsUsed &&
                o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefault();

        if (otp == null) return false;

        otp.IsUsed = true;
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task SendEmailOtpAsync(string email, string code, OtpPurpose purpose, string apiKey)
    {
        try
        {
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(
                _config["SendGrid:FromEmail"] ?? "sheesholdtown@gmail.com",
                _config["SendGrid:FromName"] ?? "SWAG app");
            var to = new EmailAddress(email);

            var purposeText = purpose switch
            {
                OtpPurpose.Signup => "Email Verification",
                OtpPurpose.ForgotPassword => "Password Reset",
                OtpPurpose.ChangeContact => "Contact Change Verification",
                _ => "Verification"
            };

            var subject = $"SWAG App — Your {purposeText} Code";
            var body = $"Your verification code is: <strong>{code}</strong><br/>This code expires in 10 minutes.<br/><br/>If you did not request this, please ignore this email.";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, code, body);
            var response = await client.SendEmailAsync(msg);

            if (!response.IsSuccessStatusCode)
                _logger.LogWarning("SendGrid returned {Status} for {Email}", response.StatusCode, email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP email to {Email}", email);
        }
    }
}
