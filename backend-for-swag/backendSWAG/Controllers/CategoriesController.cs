using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwagBackend.Data;
using SwagBackend.DTOs;

namespace SwagBackend.Controllers;

[ApiController]
[Route("api")]
public class CategoriesController : ControllerBase
{
    private readonly SwagDbContext _db;

    public CategoriesController(SwagDbContext db)
    {
        _db = db;
    }

    // GET /api/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var sections = await _db.VendorCategorySections
            .Include(s => s.Items)
            .OrderBy(s => s.Id)
            .Select(s => new CategorySectionDto
            {
                Id = s.Id,
                Name = s.Name,
                Items = s.Items.Select(i => new CategoryItemDto
                {
                    Id = i.Id,
                    SectionId = i.SectionId,
                    Name = i.Name
                }).ToList()
            })
            .ToListAsync();

        return Ok(sections);
    }

    // GET /api/event-types
    [HttpGet("event-types")]
    public async Task<IActionResult> GetEventTypes()
    {
        var types = await _db.EventTypes
            .OrderBy(t => t.Id)
            .Select(t => new EventTypeDto { Id = t.Id, Name = t.Name })
            .ToListAsync();

        return Ok(types);
    }
}
