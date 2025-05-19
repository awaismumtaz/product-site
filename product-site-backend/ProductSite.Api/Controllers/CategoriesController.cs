using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProductSite.Api.Data;
using ProductSite.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductSite.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CategoriesController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAll()
        {
            var list = await _db.Categories
                                .Include(c => c.Products)
                                .ToListAsync();
            return Ok(list);
        }

        // GET: api/categories/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Category>> GetById(int id)
        {
            var category = await _db.Categories
                                    .Include(c => c.Products)
                                    .FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
                return NotFound();
            return Ok(category);
        }

        // POST: api/categories
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Category>> Create(Category model)
        {
            _db.Categories.Add(model);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById),
                                   new { id = model.Id },
                                   model);
        }

        // PUT: api/categories/5
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, Category model)
        {
            if (id != model.Id)
                return BadRequest();

            _db.Entry(model).State = EntityState.Modified;
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Categories.AnyAsync(c => c.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/categories/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
