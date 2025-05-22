using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

public class ImageService: IImageService
{
    private readonly IWebHostEnvironment _env;
    private const string ImagesFolder = "images";

    public ImageService(IWebHostEnvironment env)
    {
        _env = env;
    }    public bool ValidateImage(IFormFile file, out string? error)
    {
        error = null;

        if (file.Length > 10 * 1024 * 1024) // 10 MB
        {
            error = "File size must be less than 10MB";
            return false;
        }

        var allowedTypes = new[] { ".jpg", ".jpeg", ".png" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedTypes.Contains(ext))
        {
            error = "Only JPEG and PNG images are allowed";
            return false;
        }

        return true;
    }

    public async Task<string> SaveImageAsync(IFormFile file)
    {
        if (!ValidateImage(file, out var error))
            throw new ArgumentException(error);

        var uploads = Path.Combine(_env.WebRootPath, ImagesFolder);
        if (!Directory.Exists(uploads))
            Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
        var filePath = Path.Combine(uploads, fileName);

        using (var image = await Image.LoadAsync(file.OpenReadStream()))
        {
            // Validate dimensions
            if (image.Width < 100 || image.Height < 100)
                throw new ArgumentException("Image dimensions must be at least 100x100 pixels");
            
            if (image.Width > 2000 || image.Height > 2000)
                throw new ArgumentException("Image dimensions cannot exceed 2000x2000 pixels");

            // Resize if needed while maintaining aspect ratio
            if (image.Width > 800 || image.Height > 800)
            {
                var ratio = Math.Min(800.0 / image.Width, 800.0 / image.Height);
                var newWidth = (int)(image.Width * ratio);
                var newHeight = (int)(image.Height * ratio);

                image.Mutate(x => x.Resize(newWidth, newHeight));
            }

            // Optimize and save
            await image.SaveAsJpegAsync(filePath, new JpegEncoder { Quality = 85 });
        }

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
