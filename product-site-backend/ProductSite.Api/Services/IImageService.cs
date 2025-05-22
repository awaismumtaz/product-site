using Microsoft.AspNetCore.Http;

public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile file);
    void DeleteImage(string imageUrl);
    bool ValidateImage(IFormFile file, out string? error);
}
