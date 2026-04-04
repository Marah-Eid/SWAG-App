namespace SwagBackend.DTOs;

public class CarDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string? Brand { get; set; }
    public string Model { get; set; } = string.Empty;
    public string? Year { get; set; }
    public string? PlateNumber { get; set; }
    public string? EngineType { get; set; }
    public string? FuelType { get; set; }
    public string? Color { get; set; }
    public string? CurrentMileage { get; set; }
    public string? LastMaintenance { get; set; }
    public string? NextMaintenance { get; set; }
    public string? InsuranceExpiry { get; set; }
    public string? RegistrationDate { get; set; }
    public string? CarImage { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCarRequest
{
    public string? Brand { get; set; }
    public string Model { get; set; } = string.Empty;
    public string? Year { get; set; }
    public string? PlateNumber { get; set; }
    public string? EngineType { get; set; }
    public string? FuelType { get; set; }
    public string? Color { get; set; }
    public string? CurrentMileage { get; set; }
    public string? LastMaintenance { get; set; }
    public DateOnly? NextMaintenance { get; set; }
    public string? InsuranceExpiry { get; set; }
    public string? RegistrationDate { get; set; }
    public string? CarImage { get; set; }
}

public class UpdateCarRequest
{
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Year { get; set; }
    public string? PlateNumber { get; set; }
    public string? EngineType { get; set; }
    public string? FuelType { get; set; }
    public string? Color { get; set; }
    public string? CurrentMileage { get; set; }
    public string? LastMaintenance { get; set; }
    public DateOnly? NextMaintenance { get; set; }
    public string? InsuranceExpiry { get; set; }
    public string? RegistrationDate { get; set; }
    public string? CarImage { get; set; }
}

public class MaintenanceRecordDto
{
    public Guid Id { get; set; }
    public Guid CarId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? RecordDate { get; set; }
    public string Status { get; set; } = "Completed";
    public DateTime CreatedAt { get; set; }
}

public class AddMaintenanceRequest
{
    public string Title { get; set; } = string.Empty;
    public string? RecordDate { get; set; }
    public string Status { get; set; } = "Completed";
}

public class UpdateMaintenanceRequest
{
    public string? Title { get; set; }
    public string? RecordDate { get; set; }
    public string? Status { get; set; }
}
