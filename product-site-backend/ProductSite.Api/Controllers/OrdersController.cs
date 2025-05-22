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
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .OrderByDescending(o => o.Timestamp)
                .ToListAsync();
            return orders;
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
        public async Task<ActionResult<Order>> CreateOrder([FromBody] List<CartItemDto> cartItems)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                    return Unauthorized();
                if (cartItems == null || cartItems.Count == 0)
                    return BadRequest("Cart is empty");

                // Validate stock and prices
                foreach (var item in cartItems)
                {
                    var product = await _context.Products.FindAsync(item.Id);
                    if (product == null)
                        return BadRequest($"Product {item.Id} not found");
                    
                    if (product.Stock < item.Quantity)
                        return BadRequest($"Insufficient stock for product {product.Name}");
                    
                    if (product.Price != item.Price)
                        return BadRequest($"Price mismatch for product {product.Name}");
                }

                var order = new Order
                {
                    UserId = userId,
                    Timestamp = DateTime.UtcNow,
                    Items = new List<OrderItem>()
                };

                // Update stock and create order items
                foreach (var item in cartItems)
                {
                    var product = await _context.Products.FindAsync(item.Id);
                    product!.Stock -= item.Quantity;
                    
                    order.Items.Add(new OrderItem
                    {
                        ProductId = item.Id,
                        ProductName = item.Name,
                        PriceAtPurchase = item.Price,
                        Quantity = item.Quantity
                    });
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true, orderId = order.Id });
            }
            catch (JsonException jsonEx)
            {
                return BadRequest($"Invalid JSON format: {jsonEx.Message}");
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Database error occurred while processing your order");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        // Get all orders (admin only)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.User)
                .OrderByDescending(o => o.Timestamp)
                .ToListAsync();
            return orders;
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
    }
}