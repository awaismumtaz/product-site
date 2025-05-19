public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile file);
    void DeleteImage(string imageUrl);
}
