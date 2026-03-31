using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SwagBackend.Services;

public interface ITokenService
{
    string GenerateToken(Guid userId, string role, string? email = null);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Guid userId, string role, string? email = null)
    {
        var secret = _config["JwtSettings:SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey not configured.");
        var issuer = _config["JwtSettings:Issuer"] ?? "SwagBackend";
        var audience = _config["JwtSettings:Audience"] ?? "SwagMobileApp";
        var expiryHours = int.Parse(_config["JwtSettings:ExpiryHours"] ?? "72");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim("role", role)
        };

        if (!string.IsNullOrEmpty(email))
            claims.Add(new Claim(ClaimTypes.Email, email));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
