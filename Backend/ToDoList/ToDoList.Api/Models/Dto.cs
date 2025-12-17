namespace ToDoList.Api.Models;

public class Dto
{
    
}
public class RegisterDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Location { get; set; } 
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
}

public class CreateTaskDto
{
    public string Header { get; set; } = string.Empty;
    public string? Body { get; set; }
    public bool IsComplete { get; set; }
    public bool IsCancelled { get; set; }
    public string? CompleteTargetDate { get; set; }
}

public class UpdateTaskDto
{
    public int Id { get; set; }
    public string Header { get; set; } = string.Empty;
    public string? Body { get; set; }
    public bool IsComplete { get; set; }
    public bool IsCancelled { get; set; }
    public string? CompleteTargetDate { get; set; }
}