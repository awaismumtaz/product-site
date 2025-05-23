using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProductSite.Api.Data;
using ProductSite.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

// Handles product reviews (only for purchased products)
[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db) => _db = db;

    // Get all reviews for a product
    [HttpGet("{productId:int}")]
    public async Task<ActionResult<IEnumerable<Review>>> GetByProduct(int productId)
    {
        var reviews = await _db.Reviews
                               .Where(r => r.ProductId == productId)
                               .OrderByDescending(r => r.Timestamp)
                               .ToListAsync();
        return Ok(reviews);
    }

    // Get all reviews by the current user
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Review>>> GetMyReviews()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        var reviews = await _db.Reviews
            .Include(r => r.Product)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Timestamp)
            .ToListAsync();

        return Ok(reviews);
    }

    // Create a review (user must have purchased the product)
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Review>> Create([FromBody] ReviewDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();
        
        // Find the most recent order that contains this product
        var order = await _db.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId && 
                   o.Items != null && o.Items.Any(i => i.ProductId == dto.ProductId))
            .OrderByDescending(o => o.Timestamp)
            .FirstOrDefaultAsync();

        if (order == null)
            return Forbid("You can only review purchased items");

        // Check if already reviewed
        var existingReview = await _db.Reviews
            .FirstOrDefaultAsync(r => r.ProductId == dto.ProductId && 
                                    r.UserId == userId &&
                                    r.OrderId == order.Id);
        
        if (existingReview != null)
            return BadRequest("You have already reviewed this item from this order");

        // Validate rating
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5");

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            Timestamp = DateTime.UtcNow,
            OrderId = order.Id
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByProduct),
                               new { productId = dto.ProductId },
                               review);
    }

    // Check if user can review a product (must have purchased but not reviewed)
    [HttpGet("canreview/{productId:int}")]
    [Authorize]
    public async Task<ActionResult<object>> CanReview(int productId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            // Check if user has purchased the product
            var hasPurchased = await _db.Orders
                .Include(o => o.Items)
                .Where(o => o.UserId == userId)
                .AnyAsync(o => o.Items != null && o.Items.Any(i => i.ProductId == productId));

            if (!hasPurchased)
            {
                return Ok(new { canReview = false, reason = "You must purchase this product to review it" });
            }

            // Check if user has already reviewed this product
            var hasReviewed = await _db.Reviews
                .AnyAsync(r => r.ProductId == productId && r.UserId == userId);

            return Ok(new 
            { 
                canReview = !hasReviewed,
                reason = hasReviewed ? "You have already reviewed this product" : null
            });
        }
        catch (Exception ex)
        {
            // Log the error
            Console.Error.WriteLine($"Error in CanReview: {ex}");
            return StatusCode(500, new { error = "An error occurred while checking review eligibility" });
        }
    }
}

public class ReviewDto
{
    public int ProductId { get; set; }
    public int Rating { get; set; }  // e.g. 1–5
    public string Comment { get; set; } = string.Empty;
}
