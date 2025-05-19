using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductSite.Api.Data;
using ProductSite.Api.Models;

namespace ProductSite.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(
            AppDbContext context,
            RoleManager<IdentityRole> roleMgr,
            UserManager<IdentityUser> userMgr)
        {
            // Apply pending migrations
            if (context.Database.GetPendingMigrations().Any())
                await context.Database.MigrateAsync();

            // Seed Roles
            var roles = new[] { "Admin", "User" };
            foreach (var role in roles)
                if (!await roleMgr.RoleExistsAsync(role))
                    await roleMgr.CreateAsync(new IdentityRole(role));

            // Seed Categories
            if (!context.Categories.Any())
            {
                var cats = new[]
                {
                    new Category { Name = "Fruits & Vegetables" },
                    new Category { Name = "Dairy" },
                    new Category { Name = "Bakery" },
                    new Category { Name = "Pantry" },
                    new Category { Name = "Beverages" }
                };
                context.Categories.AddRange(cats);
                await context.SaveChangesAsync();
            }

            //Create admin user
            string adminEmail = "admin@site.com";
            if (await userMgr.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new IdentityUser { UserName = adminEmail, Email = adminEmail };
                var result = await userMgr.CreateAsync(admin, "P@ssw0rd!");
                if (result.Succeeded)
                    await userMgr.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}