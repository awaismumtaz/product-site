using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using ProductSite.Api.Data;


var builder = WebApplication.CreateBuilder(args);



// Add DbContext
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Add Identity
builder.Services
    .AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// Configure cookie
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/api/account/login";
    options.LogoutPath = "/api/account/logout";
    options.Cookie.Name = "ProductSite.Auth";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax; // For HTTP in dev
    options.Cookie.SecurePolicy = CookieSecurePolicy.None; // For HTTP in dev
});

builder.Services.AddAuthentication()
    .AddCookie();

// Add CORS for frontend
builder.Services.AddCors(options =>
  {
      options.AddPolicy("AllowFrontend",
          policy => policy
              .WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
  });

builder.Services.AddScoped<IImageService, ImageService>();

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add authorization services
builder.Services.AddAuthorization();

// Add controller services
builder.Services.AddControllers();

var app = builder.Build();

// Only one seeding block needed
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<IdentityUser>>();

    await IdentitySeeder.SeedRolesAsync(roleManager);
    await IdentitySeeder.SeedAdminUserAsync(userManager);

    var context = services.GetRequiredService<AppDbContext>();
    await DbInitializer.SeedAsync(context, roleManager, userManager);
}

// Enable CORS
app.UseCors("AllowFrontend");
app.UseStaticFiles();

//Add authentication and authorization
app.UseAuthentication();        
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI();

app.Run();




