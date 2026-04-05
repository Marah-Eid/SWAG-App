using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwagBackend.Services;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICurrentUserService _currentUser;

    private static readonly string[] AllowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    private static readonly string[] AllowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

    private const long MaxImageBytes = 5  * 1024 * 1024; // 5 MB
    private const long MaxVideoBytes = 50 * 1024 * 1024; // 50 MB

    public UploadController(IConfiguration config, IHttpClientFactory httpClientFactory, ICurrentUserService currentUser)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _currentUser = currentUser;
    }

    // POST /api/upload/image  (kept for backwards compatibility)
    [HttpPost("image")]
    public Task<IActionResult> UploadImageCompat(IFormFile file) => UploadMedia(file);

    // POST /api/upload/media  (images + videos)
    [HttpPost("media")]
    public async Task<IActionResult> UploadMedia(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var contentType = file.ContentType.ToLower();

        bool isImage = AllowedImageTypes.Contains(contentType);
        bool isVideo = AllowedVideoTypes.Contains(contentType);

        if (!isImage && !isVideo)
            return BadRequest(new { message = "Only JPEG, PNG, WebP images and MP4/MOV/WebM videos are allowed." });

        long maxBytes = isVideo ? MaxVideoBytes : MaxImageBytes;
        if (file.Length > maxBytes)
            return BadRequest(new { message = $"File exceeds the {(isVideo ? "50" : "5")} MB limit." });

        var supabaseUrl = _config["Supabase:Url"]
            ?? throw new InvalidOperationException("Supabase:Url not configured.");
        var serviceKey = _config["Supabase:ServiceRoleKey"]
            ?? throw new InvalidOperationException("Supabase:ServiceRoleKey not configured.");

        var bucket = isVideo
            ? (_config["Supabase:MediaBucket"] ?? "app-media")
            : (_config["Supabase:ImageBucket"] ?? "app-images");

        var ext = contentType switch
        {
            "image/png"       => ".png",
            "image/webp"      => ".webp",
            "video/mp4"       => ".mp4",
            "video/quicktime" => ".mov",
            "video/x-msvideo" => ".avi",
            "video/webm"      => ".webm",
            _                 => isVideo ? ".mp4" : ".jpg"
        };

        // Organise by user: {bucket}/{userId}/{guid}{ext}
        var userId   = _currentUser.UserId;
        var fileName = $"{userId}/{Guid.NewGuid()}{ext}";

        var uploadUrl = $"{supabaseUrl}/storage/v1/object/{bucket}/{fileName}";

        using var http    = _httpClientFactory.CreateClient();
        using var stream  = file.OpenReadStream();
        using var content = new StreamContent(stream);
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
        request.Headers.Add("Authorization", $"Bearer {serviceKey}");
        request.Content = content;

        var response = await http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync();
            return StatusCode(500, new { message = "Supabase Storage upload failed.", detail });
        }

        var publicUrl = $"{supabaseUrl}/storage/v1/object/public/{bucket}/{fileName}";
        return Ok(new { url = publicUrl });
    }
}
