namespace ToDoList.Api.Models;


public class UserEntity
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Location { get; set; } // They may choose to not share location
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();

}