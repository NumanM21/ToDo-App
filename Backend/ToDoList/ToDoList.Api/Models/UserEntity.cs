namespace ToDoList.Api.Models;


public class UserEntity
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; } 
    public required string PasswordHash { get; set; }
    public string? Location { get; set; } // They may choose to not share location
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();

}