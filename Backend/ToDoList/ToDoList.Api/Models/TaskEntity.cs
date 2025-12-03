namespace ToDoList.Api.Models;

public class TaskEntity
{
    public int Id { get; set; }
    public UserEntity UserId { get; set; } = null!;
    public string Header { get; set; } = string.Empty;
    public string? Body { get; set; }
    public bool IsComplete { get; set; }
    public bool IsCancelled { get; set; }
    public DateOnly? CompleteTargetDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}