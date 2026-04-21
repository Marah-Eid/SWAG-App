using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using SwagBackend.Services;

namespace SWAG_Backend.Tests.Unit;

/// WT-01, WT-02: Token generation tests
public class TokenServiceTests
{
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "SWAG_APP_SECRET_KEY_FOR_TESTING_MIN_32_CHARACTERS_LONG",
                ["JwtSettings:Issuer"] = "SwagBackend",
                ["JwtSettings:Audience"] = "SwagMobileApp",
                ["JwtSettings:ExpiryHours"] = "72"
            })
            .Build();

        _tokenService = new TokenService(config);
    }

    [Fact]
    public void GenerateToken_ReturnsValidJwt_WithCorrectClaims()
    {
        // WT-01: Verify JWT contains correct claims (sub, role, email)
        var userId = Guid.NewGuid();
        var role = "Customer";
        var email = "test@test.com";

        var token = _tokenService.GenerateToken(userId, role, email);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal(userId.ToString(), jwt.Claims.First(c => c.Type == "sub").Value);
        Assert.Equal(role, jwt.Claims.First(c => c.Type == "role").Value);
        Assert.Equal(email, jwt.Claims.First(c => c.Type == ClaimTypes.Email).Value);
    }

    [Fact]
    public void GenerateToken_HasCorrectExpiry()
    {
        // WT-02: Verify token expiry is 72 hours
        var token = _tokenService.GenerateToken(Guid.NewGuid(), "Vendor");

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        var expectedExpiry = DateTime.UtcNow.AddHours(72);
        var actualExpiry = jwt.ValidTo;

        Assert.InRange(actualExpiry, expectedExpiry.AddMinutes(-1), expectedExpiry.AddMinutes(1));
    }

    [Fact]
    public void GenerateToken_WithoutEmail_DoesNotIncludeEmailClaim()
    {
        var token = _tokenService.GenerateToken(Guid.NewGuid(), "Customer");

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.DoesNotContain(jwt.Claims, c => c.Type == ClaimTypes.Email);
    }

    [Theory]
    [InlineData("Customer")]
    [InlineData("Vendor")]
    [InlineData("Admin")]
    public void GenerateToken_AllRoles_IncludesCorrectRole(string role)
    {
        var token = _tokenService.GenerateToken(Guid.NewGuid(), role);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal(role, jwt.Claims.First(c => c.Type == "role").Value);
    }
}
