using Microsoft.AspNetCore.Hosting;

public class ImageService : IImageService
{
    private readonly IWebHostEnvironment _env;
    private const string ImagesFolder = "images";

    public ImageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveImageAsync(IFormFile file)
    {
        var uploads = Path.Combine(_env.WebRootPath, ImagesFolder);
        if (!Directory.Exists(uploads))
            Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploads, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Return URL path, e.g. "/images/uuid.jpg"
        return $"/{ImagesFolder}/{fileName}";
    }

    public void DeleteImage(string imageUrl)
    {
        var relative = imageUrl.TrimStart('/');
        var filePath = Path.Combine(_env.WebRootPath, relative);
        if (File.Exists(filePath))
            File.Delete(filePath);
    }
}
