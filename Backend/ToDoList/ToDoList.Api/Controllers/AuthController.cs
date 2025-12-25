using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ToDoList.Api.Data;
using ToDoList.Api.Models;

namespace ToDoList.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config; //Interface to read appsettings.json (from ASP.NET) - can also read Env variables CLI Args

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }
    
    // Post - api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto dto)
    {
        // Check if user exists
        if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
            return BadRequest("Email already registered. Please login");
        
        // Create new user
        var user = new UserEntity
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Location = dto.Location,
            CreatedAt = DateTime.UtcNow
        };
        
        // Save new user to DB
        _context.Add(user);
        await _context.SaveChangesAsync();
        
        // Generate JWT Token for the user
        var token = GenerateJwtToken(user);
        
        // Return  response
        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            Location = user.Location ?? string.Empty
        });
    }
    
    // Post = api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDto dto)
    {
        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null) 
            return Unauthorized("Invalid email or password");
        
        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) // We know stored hash, so BCrypt retrieves salt and hashes users' pass, and compares the two
            return Unauthorized("Invalid email or password");
        
        // Generate JWT Token 
        var token = GenerateJwtToken(user);
        
        // Return response
        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            FirstName = user.FirstName,
            UserId = user.Id,
            Location = user.Location ?? string.Empty
        });
    }
    
    // Method to generate JWT token
    private string GenerateJwtToken(UserEntity user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var claims = new[] //Claim - info about user -- we are populating the 'claims' body of the token with user info
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.GivenName, user.FirstName)
        };

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);  //  Creates credentials using secrete key - prove token produced by us

        var token = new JwtSecurityToken(  // Follows the header.payload.signature structure of a token
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiresInMinutes"])), // since this is an INT we change to double!
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


}