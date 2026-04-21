using SwagBackend.Models;
using SWAG_Backend.Tests.Helpers;

namespace SWAG_Backend.Tests.Integration;

/// IT-28, IT-29, IT-30: Admin integration tests
public class AdminIntegrationTests
{
    [Fact]
    public void IT28_ApproveVendor_ChangesStatusToActive()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db, status: VendorStatus.Pending);
        var admin = TestDbContext.SeedAdmin(db);

        vendor.Status = VendorStatus.Active;
        db.VendorApprovalLogs.Add(new VendorApprovalLog
        {
            VendorId = vendor.Id,
            AdminId = admin.Id,
            Action = VendorStatus.Active
        });
        db.SaveChanges();

        var updated = db.Vendors.First(v => v.Id == vendor.Id);
        Assert.Equal(VendorStatus.Active, updated.Status);

        var log = db.VendorApprovalLogs.First(l => l.VendorId == vendor.Id);
        Assert.Equal(VendorStatus.Active, log.Action);
    }

    [Fact]
    public void IT29_RejectVendor_ChangesStatusToRejected()
    {
        using var db = TestDbContext.Create();
        var vendor = TestDbContext.SeedVendor(db, status: VendorStatus.Pending);
        var admin = TestDbContext.SeedAdmin(db);

        vendor.Status = VendorStatus.Rejected;
        db.VendorApprovalLogs.Add(new VendorApprovalLog
        {
            VendorId = vendor.Id,
            AdminId = admin.Id,
            Action = VendorStatus.Rejected
        });
        db.SaveChanges();

        var updated = db.Vendors.First(v => v.Id == vendor.Id);
        Assert.Equal(VendorStatus.Rejected, updated.Status);
    }

    [Fact]
    public void IT30_PlatformStats_ReturnsCorrectCounts()
    {
        using var db = TestDbContext.Create();

        TestDbContext.SeedCustomer(db, "c1@test.com");
        TestDbContext.SeedCustomer(db, "c2@test.com");
        TestDbContext.SeedVendor(db, "v1@test.com", VendorStatus.Active);
        TestDbContext.SeedVendor(db, "v2@test.com", VendorStatus.Pending);

        var customerCount = db.Customers.Count();
        var vendorCount = db.Vendors.Count();
        var pendingCount = db.Vendors.Count(v => v.Status == VendorStatus.Pending);

        Assert.Equal(2, customerCount);
        Assert.Equal(2, vendorCount);
        Assert.Equal(1, pendingCount);
    }
}
