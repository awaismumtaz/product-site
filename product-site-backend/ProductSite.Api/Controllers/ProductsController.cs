using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ProductSite.Api.Data;
using ProductSite.Api.Models;

// Handles CRUD for products and image upload
[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IImageService _imgSvc;

    public ProductsController(AppDbContext db, IImageService imgSvc)
    {
        _db = db;
        _imgSvc = imgSvc;
    }

    // Get all products (with optional filters)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll([FromQuery] int? categoryId, [FromQuery] string? search)
    {
        var query = _db.Products.Include(p => p.Reviews).AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search));

        var list = await query.ToListAsync();
        return Ok(list);
    }

    // Get a product by ID
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var prod = await _db.Products
                            .Include(p => p.Reviews)
                            .FirstOrDefaultAsync(p => p.Id == id);

        if (prod == null) return NotFound();
        return Ok(prod);
    }

    // Create a new product (admin only, with image upload)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [RequestSizeLimit(10_000_000)]  // allow up to ~10 MB
    public async Task<ActionResult<Product>> Create([FromForm] ProductDto dto)
    {
        if (dto.Image == null)
            return BadRequest("Image is required");

        var url = await _imgSvc.SaveImageAsync(dto.Image);

        var prod = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            Stock = dto.Stock,
            CategoryId = dto.CategoryId,
            ImageUrl = url
        };

        _db.Products.Add(prod);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = prod.Id }, prod);
    }

    // Update a product (admin only)
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> Update(int id, [FromForm] ProductDto dto)
    {
        var prod = await _db.Products.FindAsync(id);
        if (prod == null) return NotFound();

        prod.Name = dto.Name;
        prod.Price = dto.Price;
        prod.Stock = dto.Stock;
        prod.CategoryId = dto.CategoryId;

        if (dto.Image != null)
        {
            if (!string.IsNullOrEmpty(prod.ImageUrl))
                _imgSvc.DeleteImage(prod.ImageUrl);
            prod.ImageUrl = await _imgSvc.SaveImageAsync(dto.Image);
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Delete a product (admin only)
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var prod = await _db.Products.FindAsync(id);
        if (prod == null) return NotFound();

        if (!string.IsNullOrEmpty(prod.ImageUrl))
            _imgSvc.DeleteImage(prod.ImageUrl);

        _db.Products.Remove(prod);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Get sales data for a product (admin only)
    [HttpGet("{id:int}/sales")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> GetSalesData(int id)
    {
        var product = await _db.Products
            .Include(p => p.Orders!)
                .ThenInclude(o => o.Order)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound();

        var now = DateTime.UtcNow;
        var sixMonthsAgo = now.AddMonths(-6);

        var monthlySales = product.Orders?
            .Where(o => o.Order != null && o.Order.Timestamp >= sixMonthsAgo)
            .GroupBy(o => new { o.Order!.Timestamp.Year, o.Order.Timestamp.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Units = g.Sum(o => o.Quantity),
                Revenue = g.Sum(o => o.PriceAtPurchase * o.Quantity)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToList();

        var reviewStats = new
        {
            AverageRating = product.AverageRating,
            TotalReviews = product.Reviews?.Count ?? 0,
            RatingDistribution = (product.Reviews ?? new List<Review>())
                .GroupBy(r => r.Rating)
                .Select(g => new { Rating = g.Key, Count = g.Count() })
                .OrderBy(x => x.Rating)
                .ToList()
        };

        return Ok(new
        {
            TotalUnitsSold = product.UnitsSold,
            CurrentStock = product.Stock,
            MonthlySales = monthlySales,
            Reviews = reviewStats
        });
    }
}

// DTO for binding form-data
public class ProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int CategoryId { get; set; }
    public IFormFile? Image { get; set; }
}
