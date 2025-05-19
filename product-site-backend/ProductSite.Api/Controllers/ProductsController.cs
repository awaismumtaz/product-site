using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ProductSite.Api.Data;
using ProductSite.Api.Models;

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

    // GET: api/products
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

    // GET: api/products/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var prod = await _db.Products
                            .Include(p => p.Reviews)
                            .FirstOrDefaultAsync(p => p.Id == id);

        if (prod == null) return NotFound();
        return Ok(prod);
    }

    // POST: api/products
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [RequestSizeLimit(10_000_000)]  // allow up to ~10 MB
    public async Task<ActionResult<Product>> Create([FromForm] ProductDto dto)
    {
        // Save image
        var url = await _imgSvc.SaveImageAsync(dto.Image!);

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

    // PUT: api/products/5
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
            // delete old file
            _imgSvc.DeleteImage(prod.ImageUrl);
            // save new
            prod.ImageUrl = await _imgSvc.SaveImageAsync(dto.Image);
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/products/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var prod = await _db.Products.FindAsync(id);
        if (prod == null) return NotFound();

        _imgSvc.DeleteImage(prod.ImageUrl);

        _db.Products.Remove(prod);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// DTO for binding form-data
public class ProductDto
{
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int CategoryId { get; set; }
    public IFormFile? Image { get; set; }
}
