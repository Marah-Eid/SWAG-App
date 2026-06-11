using System.Text.Json;

namespace SwagBackend.Services;

public record VehicleInfoResult(
    string Make,
    string Model,
    string Year,
    string Trim,
    string EngineCylinders,
    string DisplacementL,
    string FuelType,
    string DriveType,
    string BodyClass,
    bool IsPartial
);

public interface IVinDecodeService
{
    Task<VehicleInfoResult?> DecodeAsync(string vin);
}

public class VinDecodeService : IVinDecodeService
{
    private readonly HttpClient _http;
    private readonly ILogger<VinDecodeService> _logger;

    public VinDecodeService(HttpClient http, ILogger<VinDecodeService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<VehicleInfoResult?> DecodeAsync(string vin)
    {
        try
        {
            var url = $"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json";
            var response = await _http.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var results = doc.RootElement.GetProperty("Results")[0];

            string Get(string key) => results.TryGetProperty(key, out var v) ? v.GetString() ?? "" : "";
            var errorCode = Get("ErrorCode");

            if (string.IsNullOrEmpty(Get("Make")) && string.IsNullOrEmpty(Get("Model")))
                return null;

            return new VehicleInfoResult(
                Make: Get("Make"),
                Model: Get("Model"),
                Year: Get("ModelYear"),
                Trim: Get("Trim"),
                EngineCylinders: Get("EngineCylinders"),
                DisplacementL: Get("DisplacementL"),
                FuelType: Get("FuelTypePrimary"),
                DriveType: Get("DriveType"),
                BodyClass: Get("BodyClass"),
                IsPartial: errorCode != "0" && !string.IsNullOrEmpty(errorCode)
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VIN decode failed for {Vin}", vin);
            return null;
        }
    }
}
