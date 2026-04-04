using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;
using SwagBackend.Models;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/cars")]
[Authorize(Roles = "Customer")]
public class CarsController : ControllerBase
{
    private readonly SwagDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CarsController(SwagDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // GET /api/cars
    [HttpGet]
    public async Task<IActionResult> GetMyCars()
    {
        var cars = await _db.CustomerCars
            .Where(c => c.CustomerId == _currentUser.UserId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => MapCar(c))
            .ToListAsync();

        return Ok(cars);
    }

    // POST /api/cars
    [HttpPost]
    public async Task<IActionResult> AddCar([FromBody] CreateCarRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Model))
            return BadRequest(new { message = "Car model is required." });

        var car = new CustomerCar
        {
            CustomerId = _currentUser.UserId,
            Brand = req.Brand,
            Model = req.Model.Trim(),
            Year = req.Year,
            PlateNumber = req.PlateNumber,
            EngineType = req.EngineType,
            FuelType = req.FuelType,
            Color = req.Color,
            CurrentMileage = req.CurrentMileage,
            LastMaintenance = req.LastMaintenance,
            NextMaintenance = req.NextMaintenance,
            InsuranceExpiry = req.InsuranceExpiry,
            RegistrationDate = req.RegistrationDate,
            CarImage = req.CarImage
        };

        _db.CustomerCars.Add(car);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCarById), new { id = car.Id }, MapCar(car));
    }

    // GET /api/cars/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCarById(Guid id)
    {
        var car = await _db.CustomerCars
            .FirstOrDefaultAsync(c => c.Id == id && c.CustomerId == _currentUser.UserId);

        if (car == null) return NotFound();
        return Ok(MapCar(car));
    }

    // PUT /api/cars/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCar(Guid id, [FromBody] UpdateCarRequest req)
    {
        var car = await _db.CustomerCars
            .FirstOrDefaultAsync(c => c.Id == id && c.CustomerId == _currentUser.UserId);

        if (car == null) return NotFound();

        if (req.Brand != null) car.Brand = req.Brand;
        if (req.Model != null) car.Model = req.Model.Trim();
        if (req.Year != null) car.Year = req.Year;
        if (req.PlateNumber != null) car.PlateNumber = req.PlateNumber;
        if (req.EngineType != null) car.EngineType = req.EngineType;
        if (req.FuelType != null) car.FuelType = req.FuelType;
        if (req.Color != null) car.Color = req.Color;
        if (req.CurrentMileage != null) car.CurrentMileage = req.CurrentMileage;
        if (req.LastMaintenance != null) car.LastMaintenance = req.LastMaintenance;
        if (req.NextMaintenance.HasValue) car.NextMaintenance = req.NextMaintenance;
        if (req.InsuranceExpiry != null) car.InsuranceExpiry = req.InsuranceExpiry;
        if (req.RegistrationDate != null) car.RegistrationDate = req.RegistrationDate;
        if (req.CarImage != null) car.CarImage = req.CarImage;
        car.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapCar(car));
    }

    // DELETE /api/cars/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCar(Guid id)
    {
        var car = await _db.CustomerCars
            .FirstOrDefaultAsync(c => c.Id == id && c.CustomerId == _currentUser.UserId);

        if (car == null) return NotFound();
        _db.CustomerCars.Remove(car);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Car deleted." });
    }

    // GET /api/cars/{id}/maintenance
    [HttpGet("{id:guid}/maintenance")]
    public async Task<IActionResult> GetMaintenanceRecords(Guid id)
    {
        var car = await _db.CustomerCars
            .FirstOrDefaultAsync(c => c.Id == id && c.CustomerId == _currentUser.UserId);
        if (car == null) return NotFound();

        var records = await _db.CarMaintenanceRecords
            .Where(r => r.CarId == id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new MaintenanceRecordDto
            {
                Id = r.Id,
                CarId = r.CarId,
                Title = r.Title,
                RecordDate = r.RecordDate,
                Status = r.Status,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(records);
    }

    // POST /api/cars/{id}/maintenance
    [HttpPost("{id:guid}/maintenance")]
    public async Task<IActionResult> AddMaintenanceRecord(Guid id, [FromBody] AddMaintenanceRequest req)
    {
        var car = await _db.CustomerCars
            .FirstOrDefaultAsync(c => c.Id == id && c.CustomerId == _currentUser.UserId);
        if (car == null) return NotFound();

        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(new { message = "Title is required." });

        var record = new CarMaintenanceRecord
        {
            CarId = id,
            Title = req.Title.Trim(),
            RecordDate = req.RecordDate,
            Status = req.Status
        };

        _db.CarMaintenanceRecords.Add(record);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMaintenanceRecords), new { id }, new MaintenanceRecordDto
        {
            Id = record.Id,
            CarId = record.CarId,
            Title = record.Title,
            RecordDate = record.RecordDate,
            Status = record.Status,
            CreatedAt = record.CreatedAt
        });
    }

    // PUT /api/cars/{carId}/maintenance/{recordId}
    [HttpPut("{carId:guid}/maintenance/{recordId:guid}")]
    public async Task<IActionResult> UpdateMaintenanceRecord(Guid carId, Guid recordId, [FromBody] UpdateMaintenanceRequest req)
    {
        var car = await _db.CustomerCars
            .FirstOrDefaultAsync(c => c.Id == carId && c.CustomerId == _currentUser.UserId);
        if (car == null) return NotFound();

        var record = await _db.CarMaintenanceRecords
            .FirstOrDefaultAsync(r => r.Id == recordId && r.CarId == carId);
        if (record == null) return NotFound();

        if (req.Title != null) record.Title = req.Title.Trim();
        if (req.RecordDate != null) record.RecordDate = req.RecordDate;
        if (req.Status != null) record.Status = req.Status;

        await _db.SaveChangesAsync();

        return Ok(new MaintenanceRecordDto
        {
            Id = record.Id,
            CarId = record.CarId,
            Title = record.Title,
            RecordDate = record.RecordDate,
            Status = record.Status,
            CreatedAt = record.CreatedAt
        });
    }

    // DELETE /api/cars/{carId}/maintenance/{recordId}
    [HttpDelete("{carId:guid}/maintenance/{recordId:guid}")]
    public async Task<IActionResult> DeleteMaintenanceRecord(Guid carId, Guid recordId)
    {
        var car = await _db.CustomerCars
            .FirstOrDefaultAsync(c => c.Id == carId && c.CustomerId == _currentUser.UserId);
        if (car == null) return NotFound();

        var record = await _db.CarMaintenanceRecords
            .FirstOrDefaultAsync(r => r.Id == recordId && r.CarId == carId);
        if (record == null) return NotFound();

        _db.CarMaintenanceRecords.Remove(record);
        await _db.SaveChangesAsync();
        return Ok(new MessageResponse { Message = "Record deleted." });
    }

    private static CarDto MapCar(CustomerCar c) => new()
    {
        Id = c.Id,
        CustomerId = c.CustomerId,
        Brand = c.Brand,
        Model = c.Model,
        Year = c.Year,
        PlateNumber = c.PlateNumber,
        EngineType = c.EngineType,
        FuelType = c.FuelType,
        Color = c.Color,
        CurrentMileage = c.CurrentMileage,
        LastMaintenance = c.LastMaintenance,
        NextMaintenance = c.NextMaintenance?.ToString("yyyy-MM-dd"),
        InsuranceExpiry = c.InsuranceExpiry,
        RegistrationDate = c.RegistrationDate,
        CarImage = c.CarImage,
        CreatedAt = c.CreatedAt
    };
}
