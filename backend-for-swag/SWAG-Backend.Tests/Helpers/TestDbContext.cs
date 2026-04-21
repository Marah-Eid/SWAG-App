using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.Models;

namespace SWAG_Backend.Tests.Helpers;

public static class TestDbContext
{
    public static SwagDbContext Create()
    {
        var options = new DbContextOptionsBuilder<SwagDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new SwagDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    public static Customer SeedCustomer(SwagDbContext db, string email = "test@test.com")
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            FullName = "Test Customer",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
            City = "Amman",
            IsVerified = true
        };
        db.Customers.Add(customer);
        db.SaveChanges();
        return customer;
    }

    public static Vendor SeedVendor(SwagDbContext db, string email = "vendor@test.com", VendorStatus status = VendorStatus.Active)
    {
        var vendor = new Vendor
        {
            Id = Guid.NewGuid(),
            FullName = "Test Vendor",
            ShopName = "Test Auto Shop",
            ShopType = "Car Parts",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
            City = "Amman",
            Status = status,
            IsVerified = true
        };
        db.Vendors.Add(vendor);
        db.SaveChanges();
        return vendor;
    }

    public static Admin SeedAdmin(SwagDbContext db, string email = "admin@test.com")
    {
        var admin = new Admin
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!")
        };
        db.Admins.Add(admin);
        db.SaveChanges();
        return admin;
    }
}
