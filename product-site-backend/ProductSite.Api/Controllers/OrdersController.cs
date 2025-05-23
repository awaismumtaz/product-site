using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductSite.Api.Data;
using ProductSite.Api.Models;
using System.Security.Claims;
using System.Text.Json;

// Handles order management for users and admins
namespace ProductSite.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            AppDbContext context, 
            UserManager<IdentityUser> userManager,
            ILogger<OrdersController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        // Get all orders for current user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                    return Unauthorized();

                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .Include(o => o.Items!)
                        .ThenInclude(i => i.Product)
                    .OrderByDescending(o => o.Timestamp)
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders for user");
                return StatusCode(500, "An error occurred while retrieving your orders");
            }
        }

        // Get a specific order for current user
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
            if (order == null)
                return NotFound();
            return order;
        }

        // Test endpoint for API health
        [HttpGet("test")]
        [AllowAnonymous]
        public ActionResult TestEndpoint()
        {
            return Ok(new { message = "Orders API is working" });
        }


        // Create a new order from cart
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] List<OrderItemDto> items)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            // Check if user is admin
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            if (await _userManager.IsInRoleAsync(user, "Admin"))
                return Forbid("Admin users cannot place orders");

            // Validate items
            if (items == null || !items.Any())
                return BadRequest("Order must contain at least one item");

            // Create order
            var order = new Order
            {
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Items = items.Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    PriceAtPurchase = item.Price
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        // Get all orders (admin only)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.User)
                .OrderByDescending(o => o.Timestamp)
                .Select(o => new
                {
                    o.Id,
                    o.Timestamp,
                    o.Items,
                    User = new
                    {
                        o.User.Email,
                        o.User.UserName
                    }
                })
                .ToListAsync();
            return Ok(orders);
        }

        // Get sales summary (admin only)
        [HttpGet("summary")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetSalesSummary()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.OrderItems.SumAsync(oi => oi.PriceAtPurchase * oi.Quantity);
            // Consider adding other stats like unique customers, average order value, etc.
            // For unique customers, ensure User is loaded if you query Orders directly, or query IdentityUsers.
            // var uniqueCustomers = await _context.Orders.Select(o => o.UserId).Distinct().CountAsync();

            return Ok(new 
            { 
                TotalOrders = totalOrders, 
                TotalRevenue = totalRevenue 
                // UniqueCustomers = uniqueCustomers 
            });
        }

        // DTO for cart items
        public class CartItemDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public int Quantity { get; set; }
        }

        public class OrderItemDto
        {
            public int ProductId { get; set; }
            public decimal Price { get; set; }
            public int Quantity { get; set; }
        }
    }
}