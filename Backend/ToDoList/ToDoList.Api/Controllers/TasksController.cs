using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoList.Api.Data;
using ToDoList.Api.Models;

namespace ToDoList.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize] // All methods now requite JWT token (other we return 401 Unauthorized)
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    // Get - api/tasks 
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskEntity>>> GetTasks()
    {
        var userId = GetUserId(); // To match logged in user - so they only see their OWN tasks now!

        var tasks = await _context.Tasks
            .Where(x => x.UserId == userId)  // x.UserId NOT x.Id (.Id is task Id, userId is the actual user Id we need to match against!)
            .ToListAsync();

        return Ok(tasks);
    }

    // Get - Api/tasks/id_number
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskEntity>> GetTaskById(int id)
    {
        var userId = GetUserId();

        var myTask = await _context.Tasks
            .Where(x => x.UserId == userId && x.Id == id) // Check UserId in TaskEntity matches userId from JWT token, and TaskEntity Id matches Id user passed in!
            .FirstOrDefaultAsync();

        if (myTask == null) return NotFound("Task not found");

        return myTask;
    }

    // Post - api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskEntity>> CreateTask(CreateTaskDto dto)
    {
        var userId = GetUserId();
        
        var task = new TaskEntity
        {
            UserId = userId, // Use JWT Token user id, not DTO user
            Header = dto.Header,
            Body = dto.Body,
            IsComplete = dto.IsComplete,
            IsCancelled = dto.IsCancelled,
            CompleteTargetDate = string.IsNullOrEmpty(dto.CompleteTargetDate)
                ? null
                : DateOnly.Parse(dto.CompleteTargetDate),
            CreatedAt = DateTime.UtcNow
        };

        _context.Add(task);
        await _context.SaveChangesAsync();

        return Ok(task);
    }

    // Put - api/tasks/id_number (Update specific task)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Task Id mismatch");
        
        // Check if Task exists AND belongs to the authorised user
        var userId = GetUserId();
        var existingTask = await _context.Tasks.FindAsync(id);
        if (existingTask == null) return NotFound("Task not found");
        if (userId != existingTask.UserId) return Forbid(); // 403 - Unauth access
        
        // Verified user, task belong to user - Now update verified TASK with new info from dto
        existingTask.Header = dto.Header;
        existingTask.Body = dto.Body;
        existingTask.IsComplete = dto.IsComplete;
        existingTask.IsCancelled = dto.IsCancelled;
        existingTask.CompleteTargetDate = string.IsNullOrEmpty(dto.CompleteTargetDate)
                ? null
                : DateOnly.Parse(dto.CompleteTargetDate);

        await _context.SaveChangesAsync();
       
        return NoContent();
    }

    // Delete - api/tasks/id_number
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userId = GetUserId();

        var myTask = await _context.Tasks
            .Where(x => x.UserId == userId && x.Id == id)
            .FirstOrDefaultAsync();
            
        if (myTask == null) return NotFound("Task not found");

        _context.Tasks.Remove(myTask);
        
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    // Helper to get UserId from JWT 
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;    // ClaimTypes.NameIdentifier - where we stored UserId in AuthController

        if (userIdClaim == null) throw new UnauthorizedAccessException("User Id not found in token");

        return int.Parse(userIdClaim);
    }
}