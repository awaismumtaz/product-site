using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProductSite.Api.Data;
using ProductSite.Api.Models;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db) => _db = db;

    // GET: api/reviews/5
    [HttpGet("{productId:int}")]
    public async Task<ActionResult<IEnumerable<Review>>> GetByProduct(int productId)
    {
        var reviews = await _db.Reviews
                               .Where(r => r.ProductId == productId)
                               .OrderByDescending(r => r.Timestamp)
                               .ToListAsync();
        return Ok(reviews);
    }

    // POST: api/reviews
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Review>> Create([FromBody] ReviewDto dto)
    {
        var userId = User.Identity!.Name!;
        // Verify purchase
        var bought = await _db.Orders
            .Where(o => o.UserId == userId)
            .SelectMany(o => o.Items)
            .AnyAsync(i => i.ProductId == dto.ProductId);

        if (!bought)
            return Forbid("You can only review purchased items");

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            Timestamp = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByProduct),
                               new { productId = dto.ProductId },
                               review);
    }
}

public class ReviewDto
{
    public int ProductId { get; set; }
    public int Rating { get; set; }  // e.g. 1–5
    public string Comment { get; set; } = null!;
}
