using Microsoft.EntityFrameworkCore;
using ToDoList.Api.Controllers;
using ToDoList.Api.Data;
using ToDoList.Api.Models;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace ToDoList.Tests.Controllers;

public class AuthControllerTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private IConfiguration GetConfiguration()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "JwtSettings:SecretKey", "ThisIsAVerySecretKeyForTestingPurposesOnly12345678901234567890" },
            { "JwtSettings:Issuer", "TestIssuer" },
            { "JwtSettings:Audience", "TestAudience" },
            { "JwtSettings:ExpiresInMinutes", "60" }
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    [Fact]
    public async Task Register_ValidData_ReturnsOkWithToken()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var config = GetConfiguration();
        var controller = new AuthController(context, config);

        var dto = new RegisterDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com",
            Password = "Password123!",
            Location = "London"
        };

        // Act
        var result = await controller.Register(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);
        
        Assert.NotEmpty(response.Token);
        Assert.Equal("john@test.com", response.Email);
        Assert.Equal("John", response.FirstName);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var config = GetConfiguration();
        var controller = new AuthController(context, config);

        var registerDto = new RegisterDto
        {
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@test.com",
            Password = "Password123!",
            Location = "London"
        };
        await controller.Register(registerDto);

        var loginDto = new LoginDto
        {
            Email = "jane@test.com",
            Password = "Password123!"
        };

        // Act
        var result = await controller.Login(loginDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);
        
        Assert.NotEmpty(response.Token);
        Assert.Equal("jane@test.com", response.Email);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var config = GetConfiguration();
        var controller = new AuthController(context, config);

        await controller.Register(new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@test.com",
            Password = "CorrectPassword123!",
            Location = "London"
        });

        var loginDto = new LoginDto
        {
            Email = "test@test.com",
            Password = "WrongPassword123!"
        };

        // Act
        var result = await controller.Login(loginDto);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}