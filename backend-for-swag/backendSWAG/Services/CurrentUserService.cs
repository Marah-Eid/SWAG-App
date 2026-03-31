using System.Security.Claims;

namespace SwagBackend.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Role { get; }
    bool IsCustomer { get; }
    bool IsVendor { get; }
    bool IsAdmin { get; }
}

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(value, out var id) ? id : Guid.Empty;
        }
    }

    public string Role =>
        _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value
        ?? string.Empty;

    public bool IsCustomer => Role == "Customer";
    public bool IsVendor => Role == "Vendor";
    public bool IsAdmin => Role == "Admin";
}
