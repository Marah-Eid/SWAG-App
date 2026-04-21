using SwagBackend.Models;
using SWAG_Backend.Tests.Helpers;

namespace SWAG_Backend.Tests.Integration;

/// IT-22, IT-23, IT-24: Car management integration tests
public class CarIntegrationTests
{
    [Fact]
    public void IT22_AddCar_LinksToCustomer()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);

        var car = new CustomerCar
        {
            CustomerId = customer.Id,
            Brand = "Toyota",
            Model = "Camry",
            Year = "2024",
            PlateNumber = "ABC-1234"
        };
        db.CustomerCars.Add(car);
        db.SaveChanges();

        var saved = db.CustomerCars.FirstOrDefault(c => c.CustomerId == customer.Id);
        Assert.NotNull(saved);
        Assert.Equal("Toyota", saved.Brand);
        Assert.Equal("Camry", saved.Model);
        Assert.Equal("2024", saved.Year);
    }

    [Fact]
    public void IT23_AddMaintenanceRecord_LinksToCar()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);

        var car = new CustomerCar
        {
            CustomerId = customer.Id,
            Brand = "Honda",
            Model = "Civic",
            Year = "2023",
            PlateNumber = "XYZ-5678"
        };
        db.CustomerCars.Add(car);
        db.SaveChanges();

        var record = new CarMaintenanceRecord
        {
            CarId = car.Id,
            Title = "Oil Change",
            RecordDate = "2026-04-15",
            Status = "Completed"
        };
        db.CarMaintenanceRecords.Add(record);
        db.SaveChanges();

        var saved = db.CarMaintenanceRecords.FirstOrDefault(r => r.CarId == car.Id);
        Assert.NotNull(saved);
        Assert.Equal("Oil Change", saved.Title);
        Assert.Equal("Completed", saved.Status);
    }

    [Fact]
    public void IT24_DeleteCar_RemovesMaintenanceRecords()
    {
        using var db = TestDbContext.Create();
        var customer = TestDbContext.SeedCustomer(db);

        var car = new CustomerCar
        {
            CustomerId = customer.Id,
            Brand = "Nissan",
            Model = "Altima",
            Year = "2022",
            PlateNumber = "DEF-9012"
        };
        db.CustomerCars.Add(car);
        db.SaveChanges();

        db.CarMaintenanceRecords.Add(new CarMaintenanceRecord
        {
            CarId = car.Id,
            Title = "Tire Rotation",
            RecordDate = "2026-03-01"
        });
        db.SaveChanges();

        db.CarMaintenanceRecords.RemoveRange(db.CarMaintenanceRecords.Where(r => r.CarId == car.Id));
        db.CustomerCars.Remove(car);
        db.SaveChanges();

        Assert.Null(db.CustomerCars.FirstOrDefault(c => c.Id == car.Id));
        Assert.Empty(db.CarMaintenanceRecords.Where(r => r.CarId == car.Id));
    }
}
