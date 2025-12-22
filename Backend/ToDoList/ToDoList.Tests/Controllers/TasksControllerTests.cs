using Microsoft.EntityFrameworkCore; // For DbContext and InMemory database
using ToDoList.Api.Controllers; // Our TasksController to test
using ToDoList.Api.Data; // AppDbContext
using ToDoList.Api.Models; // TaskEntity, DTOs
using Xunit; // Testing framework (provides [Fact], Assert)
using Microsoft.AspNetCore.Mvc; // For action results (OkObjectResult, NotFoundResult, etc.)
using System.Security.Claims; // For simulating JWT claims
using Microsoft.AspNetCore.Http; // For HTTP context

namespace ToDoList.Tests.Controllers;

public class TasksControllerTests
{
    // Helper method - creates in-memory database for testing -- Fast, isolated 
    private AppDbContext GetInMemoryDbContext()
    {
        // DbContextOptionsBuilder - Configures HOW DbC connects to DB
        var options = new DbContextOptionsBuilder<AppDbContext>()
            //  UseInMemoryDB - Tells EF to use RAM instead of PostgreSQL
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB Name for each test
            .Options; // Converts builder to options object (so we can pass this into DbContext!)

        // New context with in-memory DB
        var context = new AppDbContext(options);
        return context;
    }

    // Helper method - simulates Authenticated User - TaskController usues [Authorize] which reads User.FindFirst(ClaimType.NameIdentifier) - Hence we need this
    private void SetupAuthenticatedUser(TasksController controller, int userId)
    {
        // Create claim - a piece of info about user (KVP in JWT)
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier,
                userId.ToString()) // This is what our AuthController stores (new....) -- .ToString as claims ALWAYS strings!
        };
        // ClaimsIdentity - represents user's identity (collection of claims) - Just need AN authenticationType - We used TestAuth! (JWT another type) -- Identity (who the user is)
        var identity = new ClaimsIdentity(claims, "TestAuth");
        // claimsPrinciple (actual User OBJECT) - ASP.NET uses this - ONE USER can have multiple identities 
        var claimsPrinciple = new ClaimsPrincipal(identity);

        // Attach to controller - controller.ControllerContext (holds req info - HTTP context, User, Routing)
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext // Creating a FAKE HTTP context with our fake user!
            {
                // User - what [Authorize] and User.FindFirst reads!
                User = claimsPrinciple
            }
        };
    }

    // Test 1 - Create Task - Expected path
    //// Create Task - Return 200 - Saves to DB
    [Fact] // Mark as test method - xUnit will run this automatically
    public async Task CreateTask_ValidData_ReturnsOkWithTask()
    {
        //// Arrange - Set up test conditions
        // Create fake DB
        var fakeDatabase = GetInMemoryDbContext();

        // Create controller with fake DB
        var fakeController = new TasksController(fakeDatabase);

        // Simulate that user ID 1 is logged in 
        SetupAuthenticatedUser(fakeController, 1);

        // Create Test data (DTO that frontend would send in)
        var fakeDto = new CreateTaskDto()
        {
            Header = "Test Header",
            Body = "Test Body",
            IsComplete = false,
            IsCancelled = false,
            CompleteTargetDate = "2024-12-29"
        };

        //// Act - Execute code we are testing
        // Call ACTUAL controller method in our api Controllers class
        var result = await fakeController.CreateTask(fakeDto);

        //// Assert - Verify if results are correct
        // Assert.IsType<Ok...> check if returned 200 OK! (if not 200, Assert would FAIL this test) -- result.Result - IActionResult value from ActionResult<TaskEntity> in real class
        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        // okResult.Value - data inside the 200 Ok response OBJECT -- Assert to check if NOW we have a TaskEntity 
        var task = Assert.IsType<TaskEntity>(okResult.Value);

        // Verify the task has correct data (what we sent via our fakeDto above)
        Assert.Equal("Test Header", task.Header);
        Assert.Equal("Test Body", task.Body);
        Assert.Equal(1, task.UserId);
    }

    // Test 2 - Get Tasks - User isolation
    //// Test GetTask ONLY returns tasks belonging to logged-in user -- Security (JWT) test - User 1 CAN'T see user 2 tasks
    [Fact]
    public async Task GetTasks_ReturnOnlyUserTasks()
    {
        // Arrange
        var context = GetInMemoryDbContext();

        // Seed DB with tasks for DIFFERENT users
        context.Tasks.AddRange(
            new TaskEntity { UserId = 1, Header = "User 1 Header", CreatedAt = DateTime.UtcNow },
            new TaskEntity { UserId = 1, Header = "User 1 Header 2", CreatedAt = DateTime.UtcNow },
            new TaskEntity { UserId = 2, Header = "User 2 Header", CreatedAt = DateTime.UtcNow }
        );

        // save to IN-MEMORY DB
        await context.SaveChangesAsync();

        var controller = new TasksController(context);

        // Simulate User 1 is logged in
        SetupAuthenticatedUser(controller, 1);

        // Act
        // Call GetTasks - Expecting only return User 1 tasks (so 2)
        var result = await controller.GetTasks();

        // Assert
        // Check if returned 200 OK 
        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        // Assert.IsAssignableFrom -- Check if value is IEnumerable of type TaskEntity -- Accepts derives types (IsType doesn't)
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskEntity>>(okResult.Value);

        // Should return ONLY 2 tasks
        Assert.Equal(2, tasks.Count());

        // Assert.All -- Checks EVERY item in collection passes OUR condition we set - Double check tasks returned DO all belong to user ID 1
        Assert.All(tasks, t => Assert.Equal(1, t.UserId));
    }
    
    // Test 3 - Update Task - Security Check 
    //// Tests users CAN'T update other users' tasks -- Security test  - Prevents unauth access
    [Fact]
    public async Task UpdateTask_WrongUser_ReturnsForbid()
    {
        // Arrange
        var context = GetInMemoryDbContext();

        // Create task belonging to user 2
        var task = new TaskEntity
        {
            UserId = 2,
            Header = "User 2 Header",
            Body = "User 2 body",
            CreatedAt = DateTime.UtcNow
        };
        context.Tasks.Add(task);
        await context.SaveChangesAsync();

        var controller = new TasksController(context);

        // Simulate user 1 logged in 
        SetupAuthenticatedUser(controller, 1);

        // Dto from frontend would be User 1 now id being passed back
        var dto = new UpdateTaskDto
        {
            Id = task.Id,
            Header = "Invalid User Header",
            Body = "Invalid User Body",
            IsComplete = false,
            IsCancelled = false
        };

        // Act
        // Should fail with 403 Forbidden
        var result = await controller.UpdateTask(task.Id, dto);

        // Assert
        // ForbidResult - ASP.NET - you're  authenticated (have JWT), but not authorised (wrong id)
        Assert.IsType<ForbidResult>(result);

    }
    
    // Test 4 - Delete Task not found
    //// Tests deleting non-existent task returns 404 -- Error handling test -- Do we handle exceptions being thrown correctly?
    [Fact]
    public async Task DeleteTask_TaskNotFound_ReturnsNotFound()
    {
        // Arrange

        var context = GetInMemoryDbContext();
        var controller = new TasksController(context);
        SetupAuthenticatedUser(controller, userId:1);
        
        // Act
        
        // Try to delete Task with task ID which doesn't exist
        var result = await controller.DeleteTask(999);
        
        // Assert
        // NotFoundObject -- Returns 404 Not found (returns 404 WITH a message)
        Assert.IsType<NotFoundObjectResult>(result);
    }
}


