using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoList.Api.Data;
using ToDoList.Api.Models;

namespace ToDoList.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
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
        var tasks = await _context.Tasks.ToListAsync();

        return tasks;
    }

    // Get - Api/tasks/id_number
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskEntity>> GetTaskById(int id)
    {
        var myTask = await _context.Tasks.FindAsync(id); // retrieves our value

        if (myTask == null) return NotFound("Product doesn't exist");

        return myTask;
    }

    // Post - api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskEntity>> CreateTask(TaskEntity task)
    {
        _context.Add(task);

        if (await _context.SaveChangesAsync() > 0)
        {
            return Ok();
        }

        return BadRequest("Task not created");
    }

    // Put - api/tasks/id_number (Update specific task)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, TaskEntity task)
    {
        if (id != task.Id) return BadRequest("Id do not match");

        _context.Tasks.Update(task);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Tasks.AnyAsync(x => x.Id == id)) return NotFound("Task does not exist");
            throw; // Need to avoid silent data corruption - we only handle a specific error (task not found), not ALL errors!
        }

        return NoContent();
    }

    // Delete - api/tasks/id_number
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var myTask = await _context.Tasks.FindAsync(id);

        if (myTask == null) return NotFound("Task not found");

        _context.Tasks.Remove(myTask);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}