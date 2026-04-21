using Microsoft.EntityFrameworkCore;
using SwagBackend.Models;
using SWAG_Backend.Tests.Helpers;

namespace SWAG_Backend.Tests.Integration;

/// IT-01 to IT-05: Authentication integration tests
public class AuthIntegrationTests
{
    [Fact]
    public void IT01_RegisterCustomer_CreatesRecordInDatabase()
    {
        using var db = TestDbContext.Create();

        var customer = new Customer
        {
            FullName = "Ahmad Ali",
            Email = "ahmad@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass123!"),
            City = "Amman"
        };

        db.Customers.Add(customer);
        db.SaveChanges();

        var saved = db.Customers.FirstOrDefault(c => c.Email == "ahmad@test.com");
        Assert.NotNull(saved);
        Assert.Equal("Ahmad Ali", saved.FullName);
        Assert.Equal("Amman", saved.City);
        Assert.False(saved.IsVerified);
    }

    [Fact]
    public void IT02_RegisterVendor_CreatesVendorAndDocument()
    {
        using var db = TestDbContext.Create();

        var vendor = new Vendor
        {
            FullName = "Omar Shop",
            ShopName = "Omar Auto Parts",
            ShopType = "Car Parts",
            Email = "omar@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass123!"),
            City = "Riyadh",
            Status = VendorStatus.Pending
        };

        db.Vendors.Add(vendor);
        db.SaveChanges();

        var doc = new VendorDocument
        {
            VendorId = vendor.Id,
            LicenseFile = "https://storage.example.com/license.pdf",
            IdFrontFile = "https://storage.example.com/id-front.jpg"
        };

        db.VendorDocuments.Add(doc);
        db.SaveChanges();

        var savedVendor = db.Vendors.FirstOrDefault(v => v.Email == "omar@test.com");
        var savedDoc = db.VendorDocuments.FirstOrDefault(d => d.VendorId == vendor.Id);

        Assert.NotNull(savedVendor);
        Assert.Equal(VendorStatus.Pending, savedVendor.Status);
        Assert.NotNull(savedDoc);
        Assert.Equal("https://storage.example.com/license.pdf", savedDoc.LicenseFile);
    }

    [Fact]
    public void IT03_LoginWithValidCredentials_PasswordVerifies()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);

        var found = db.Customers.FirstOrDefault(c => c.Email == customer.Email);
        Assert.NotNull(found);
        Assert.True(BCrypt.Net.BCrypt.Verify("Test123!", found.PasswordHash));
    }

    [Fact]
    public void IT04_LoginWithInvalidPassword_VerificationFails()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);

        var found = db.Customers.FirstOrDefault(c => c.Email == customer.Email);
        Assert.NotNull(found);
        Assert.False(BCrypt.Net.BCrypt.Verify("WrongPassword!", found.PasswordHash));
    }

    [Fact]
    public void IT05_UnverifiedAccount_IsDetectable()
    {
        using var db = TestDbContext.Create();

        var customer = new Customer
        {
            FullName = "Unverified User",
            Email = "unverified@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass123!"),
            IsVerified = false
        };
        db.Customers.Add(customer);
        db.SaveChanges();

        var found = db.Customers.First(c => c.Email == "unverified@test.com");
        Assert.False(found.IsVerified);
    }
}
