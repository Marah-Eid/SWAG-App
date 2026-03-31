using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwagBackend.Models;

[Table("customer_cars")]
public class CustomerCar
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("customer_id"), Required]
    public Guid CustomerId { get; set; }

    [Column("brand"), MaxLength(100)]
    public string? Brand { get; set; }

    [Column("model"), MaxLength(150), Required]
    public string Model { get; set; } = string.Empty;

    [Column("year"), MaxLength(10)]
    public string? Year { get; set; }

    [Column("plate_number"), MaxLength(50)]
    public string? PlateNumber { get; set; }

    [Column("engine_type"), MaxLength(100)]
    public string? EngineType { get; set; }

    [Column("fuel_type"), MaxLength(50)]
    public string? FuelType { get; set; }

    [Column("color"), MaxLength(50)]
    public string? Color { get; set; }

    [Column("current_mileage"), MaxLength(50)]
    public string? CurrentMileage { get; set; }

    [Column("last_maintenance"), MaxLength(50)]
    public string? LastMaintenance { get; set; }

    [Column("next_maintenance")]
    public DateOnly? NextMaintenance { get; set; }

    [Column("insurance_expiry"), MaxLength(50)]
    public string? InsuranceExpiry { get; set; }

    [Column("registration_date"), MaxLength(50)]
    public string? RegistrationDate { get; set; }

    [Column("car_image")]
    public string? CarImage { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

    public ICollection<CarMaintenanceRecord> MaintenanceRecords { get; set; } = new List<CarMaintenanceRecord>();
}

[Table("car_maintenance_records")]
public class CarMaintenanceRecord
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("car_id"), Required]
    public Guid CarId { get; set; }

    [Column("title"), MaxLength(200), Required]
    public string Title { get; set; } = string.Empty;

    [Column("record_date"), MaxLength(50)]
    public string? RecordDate { get; set; }

    [Column("status"), MaxLength(50)]
    public string Status { get; set; } = "Completed";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CarId")]
    public CustomerCar Car { get; set; } = null!;
}
