using Microsoft.AspNetCore.Identity;

namespace ProductSite.Api.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public IdentityUser User { get; set; } = null!;
        public DateTime Timestamp { get; set; }
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    }
}
