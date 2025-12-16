using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Connections;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ToDoList.Api.Data;
using ToDoList.Api.Models;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args); // Sets up IConfiguration, reads appsettings.json (prod prio over dev), read env variables, read CLI Argu, registers IConfiguration in DI container

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme  // Tells swagger explicitly this API will use JWT token (in auth header)
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement // Swagger now knows all endpoints require auth by default
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Services  for  DI

// Service for DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
//Console.WriteLine($"Connection String: {builder.Configuration.GetConnectionString("DefaultConnection")}");

// Service for JWTAuth
var jwtSettings = builder.Configuration.GetSection("JwtSettings"); // Reads appsettings.json for section called JwtSettings  - control dev/prod env through this
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(opt =>   // Adds auth to DI and sets default scheme to JWT Bearer (will use this when we use [Authorize] in controller)
    {
        opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters // Config for how to validate JWT tokens 
        {
            ValidateIssuer = true, //(check iss - issuer is me, not another system)
            ValidateAudience = true, //(check aud - audience, who the token is for - if token for another service and use it or if token already used across services)
            ValidateLifetime = true, // check exp claim (info in the token) - security 
            ValidateIssuerSigningKey = true, // validate token sig using secrete key - token not tampered with
            ValidIssuer = jwtSettings["Issuer"], // (check iss - issuer is me, not another system)
            ValidAudience = jwtSettings["Audience"], //(check aud - audience, who the token is for - if token for another service and use it or if token already used across services)
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)) // validate token sig using secrete key - token not tampered with
        };
    });

builder.Services.AddAuthorization(); // enables [Authorize] attribute

var app = builder.Build();

// Seed data for development
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    // Ensure database is created
    context.Database.EnsureCreated();
    
    // Seed users if empty
    if (!context.Users.Any())
    {
        var users = new List<UserEntity>
        {
            new UserEntity
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Location = "London",
                CreatedAt = DateTime.UtcNow
            },
            new UserEntity
            {
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Location = "Manchester",
                CreatedAt = DateTime.UtcNow
            }
        };
        
        context.Users.AddRange(users);
        context.SaveChanges();
        
        // Now seed tasks for these users
        var john = context.Users.First(u => u.Email == "john@example.com");
        var jane = context.Users.First(u => u.Email == "jane@example.com");
        
        var tasks = new List<TaskEntity>
        {
            new TaskEntity
            {
                UserId = john.Id,
                Header = "Buy groceries",
                Body = "Milk, eggs, bread, and butter",
                IsComplete = false,
                IsCancelled = false,
                CompleteTargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
                CreatedAt = DateTime.UtcNow
            },
            new TaskEntity
            {
                UserId = john.Id,
                Header = "Finish project",
                Body = "Complete backend API and React frontend",
                IsComplete = false,
                IsCancelled = false,
                CompleteTargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                CreatedAt = DateTime.UtcNow
            },
            new TaskEntity
            {
                UserId = jane.Id,
                Header = "Book dentist appointment",
                Body = "Call dental office tomorrow morning",
                IsComplete = true,
                IsCancelled = false,
                CompleteTargetDate = DateOnly.FromDateTime(DateTime.UtcNow),
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        };
        
        context.Tasks.AddRange(tasks);
        context.SaveChanges();
        
        Console.WriteLine("Database seeded successfully!");
    }
}

// Middleware (after the app is BUILT!) - BEFORE we execute our controllers (otherwise controllers prio'd over auth checks)
app.UseAuthentication(); // Reads token, validates and populates user
app.UseAuthorization(); // Checks if user is authorised by endpoint




// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Enable swagger.json
    app.UseSwaggerUI(); // Enable UI at /swagger /// **Default URL:** `http(s)://localhost:{port}/swagger`
}

app.UseHttpsRedirection();

app.MapControllers(); // maps to controllers - scans for clsses with [ApiController] - reads [Route] and does routing for our API classes

app.Run();
