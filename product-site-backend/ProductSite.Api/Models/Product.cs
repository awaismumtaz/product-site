using System.Text.Json.Serialization;

namespace ProductSite.Api.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = null!;

        // Category
        public int CategoryId { get; set; }
        [JsonIgnore]
        public Category? Category { get; set; }

        // Reviews
        public ICollection<Review>? Reviews { get; set; } = new List<Review>();

        // Orders
        public ICollection<OrderItem>? Orders { get; set; } = new List<OrderItem>();

        // Helper method to calculate average rating
        public double? AverageRating => Reviews?.Any() == true
            ? Math.Round(Reviews.Average(r => r.Rating), 1)
            : null;

        // Total units sold
        public int UnitsSold => Orders?.Sum(o => o.Quantity) ?? 0;
    }
}
