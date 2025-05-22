using System.Text.Json.Serialization;

namespace ProductSite.Api.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        
        // Link to order
        public int OrderId { get; set; }       
        public Order? Order { get; set; }
        
        // Snapshot of product
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public string ProductName { get; set; } = null!;
        public decimal PriceAtPurchase { get; set; }

        // Quantity
        public int Quantity { get; set; }
    }
}
