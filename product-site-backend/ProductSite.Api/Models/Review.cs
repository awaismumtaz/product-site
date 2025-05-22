using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ProductSite.Api.Models
{
    public class Review
    {
        public int Id { get; set; }
       
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public string UserId { get; set; } = null!;
        
        [Required]
        [MinLength(10)]
        [MaxLength(1000)]
        public string Comment { get; set; } = null!;
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        public DateTime Timestamp { get; set; }

        public int OrderId { get; set; }
        public Order? Order { get; set; }
    }
}
