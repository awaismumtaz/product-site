using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Handles user registration, login, logout, and user info
namespace ProductSite.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;

        public AccountController(SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
        }

        public record LoginRequest(string Email, string Password);
        public record RegisterRequest(string Email, string Password);
        public record ChangePasswordRequest(string UserId, string NewPassword);
        public record CreateAdminRequest(string Email, string Password);

        // Register a new user
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest input)
        {
            var existing = await _userManager.FindByEmailAsync(input.Email);
            if (existing != null)
                return BadRequest("User already exists");

            var user = new IdentityUser
            {
                Email = input.Email,
                UserName = input.Email
            };

            var result = await _userManager.CreateAsync(user, input.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "User");
            await _signInManager.SignInAsync(user, isPersistent: true);
            return Ok("Registered and signed in");
        }

        // Create a new admin user (admin only)
        [HttpPost("create-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest input)
        {
            var existing = await _userManager.FindByEmailAsync(input.Email);
            if (existing != null)
                return BadRequest("User already exists");

            var user = new IdentityUser
            {
                Email = input.Email,
                UserName = input.Email,
                EmailConfirmed = true // Auto-confirm admin emails
            };

            var result = await _userManager.CreateAsync(user, input.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "Admin");
            return Ok("Admin user created successfully");
        }

        // Login an existing user
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var user = await _userManager.FindByEmailAsync(login.Email);
            if (user == null)
                return Unauthorized("Invalid credentials");

            var result = await _signInManager.PasswordSignInAsync(user, login.Password, isPersistent: true, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized("Invalid credentials");

            return Ok("Login successful");
        }

        // Logout the user
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok("Logged out");
        }

        // Get info about the current user
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            if (!User.Identity!.IsAuthenticated)
                return Unauthorized();

            var user = await _userManager.FindByNameAsync(User.Identity.Name!);
            if (user == null)
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                User.Identity.Name,
                Roles = roles,
                Claims = User.Claims.Select(c => new { c.Type, c.Value })
            });
        }

        // Get all users (admin only)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    Roles = roles,
                    user.EmailConfirmed,
                    user.LockoutEnd
                });
            }

            return Ok(userList);
        }

        // Delete a user (admin only)
        [HttpDelete("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            // Prevent deleting the last admin
            if (await _userManager.IsInRoleAsync(user, "Admin"))
            {
                var adminCount = (await _userManager.GetUsersInRoleAsync("Admin")).Count;
                if (adminCount <= 1)
                    return BadRequest("Cannot delete the last admin user");
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("User deleted successfully");
        }

        // Change user password (admin only)
        [HttpPost("change-password")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserPassword([FromBody] ChangePasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
                return NotFound("User not found");

            // Remove existing password
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("Password changed successfully");
        }
    }
}

