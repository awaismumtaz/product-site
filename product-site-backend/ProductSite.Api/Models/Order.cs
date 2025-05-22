using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace ProductSite.Api.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        [JsonIgnore]
        public IdentityUser? User { get; set; }
        public DateTime Timestamp { get; set; }
        public ICollection<OrderItem>? Items { get; set; } = new List<OrderItem>();
    }
}
