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
        public Category Category { get; set; } = null!;

        // Reviews
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
