using Microsoft.AspNetCore.Identity;

namespace ProductSite.Api.Data
{
    public class IdentitySeeder
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = { "Admin", "User" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        public static async Task SeedAdminUserAsync(UserManager<IdentityUser> userManager)
        {
            string adminEmail = "admin@grocery.com";
            string password = "Admin123!"; 

            var existingUser = await userManager.FindByEmailAsync(adminEmail);
            if (existingUser != null) return;

            var user = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, password);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(user, "Admin");
        }
    }
}
