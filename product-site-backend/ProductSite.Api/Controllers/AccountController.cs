using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok("Logged out");
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            if (!User.Identity!.IsAuthenticated)
                return Unauthorized();

            return Ok(new
            {
                User.Identity.Name,
                Claims = User.Claims.Select(c => new { c.Type, c.Value })
            });
        }
    }
}

