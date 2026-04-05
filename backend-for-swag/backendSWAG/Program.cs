using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using SwagBackend.Data;
using SwagBackend.Models;
using SwagBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Logging ───────────────────────────────────────────────────────────────────
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// ── Database (Supabase PostgreSQL via Npgsql) ─────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

NpgsqlDataSource dataSource;
try
{
    var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);

    // Register PostgreSQL enum types
    // These names must EXACTLY match your Supabase enum names (run: SELECT typname FROM pg_type WHERE typtype = 'e')
    dataSourceBuilder.MapEnum<UserRole>("user_role");
    dataSourceBuilder.MapEnum<VendorStatus>("vendor_status");
    dataSourceBuilder.MapEnum<OtpPurpose>("otp_purpose");
    dataSourceBuilder.MapEnum<MessageType>("message_type");
    dataSourceBuilder.MapEnum<PostType>("post_type");
    dataSourceBuilder.MapEnum<MediaType>("media_type");
    dataSourceBuilder.MapEnum<NotificationType>("notification_type");

    dataSource = dataSourceBuilder.Build();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"[STARTUP ERROR] Failed to build Npgsql data source: {ex.Message}");
    throw;
}

builder.Services.AddDbContext<SwagDbContext>(options =>
{
    options.UseNpgsql(dataSource);
    // Enable detailed EF Core errors and sensitive data logging in development
    if (builder.Environment.IsDevelopment())
    {
        options.EnableDetailedErrors();
        options.EnableSensitiveDataLogging();
    }
});

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience            = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew                = TimeSpan.Zero
        };

        // Log JWT errors to the console in development
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                if (builder.Environment.IsDevelopment())
                    Console.Error.WriteLine($"[JWT ERROR] {ctx.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// ── HTTP Client (used by UploadController for Supabase Storage) ───────────────
builder.Services.AddHttpClient();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "SWAG Backend API",
        Version     = "v1",
        Description = "Automotive marketplace backend for SWAG mobile app"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Enter: Bearer {token}",
        Name        = "Authorization",
        In          = ParameterLocation.Header,
        Type        = SecuritySchemeType.ApiKey,
        Scheme      = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── DB Connection Test (runs once on startup) ─────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SwagDbContext>();
    try
    {
        await db.Database.CanConnectAsync();
        Console.WriteLine("✅ Database connection successful.");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"❌ Database connection FAILED: {ex.Message}");
        Console.Error.WriteLine("Check your connection string in appsettings.json:");
        Console.Error.WriteLine("  Host=db.xxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=...;SSL Mode=Require;Trust Server Certificate=true");
        // Do NOT throw here — let the app start so Swagger is still accessible
    }
}

// ── Middleware Pipeline ───────────────────────────────────────────────────────
// Swagger available in ALL environments so you can always test locally
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SWAG API v1");
    c.RoutePrefix = "swagger";
});

// Global error handler — returns JSON instead of HTML for 500 errors
app.UseExceptionHandler(errApp =>
{
    errApp.Run(async ctx =>
    {
        ctx.Response.StatusCode  = 500;
        ctx.Response.ContentType = "application/json";
        var feature = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var message = app.Environment.IsDevelopment()
            ? feature?.Error?.ToString()
            : "An internal server error occurred.";
        await ctx.Response.WriteAsJsonAsync(new { error = message });
    });
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();