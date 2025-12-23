using System.ComponentModel.DataAnnotations;

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
    [Required(ErrorMessage = "Location is required!")] 
    public string Location { get; set; } 
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

// Location Validation DTO - Comes FROM frontend
public class ValidateLocationDto
{
    // Location string user entered 
    public string Location { get; set; } = string.Empty;
}

// Response DTO for validated location -- Sent back to frontend with validated location
public class ValidatedLocationDto
{
    public bool Valid { get; set; }
    public string FormattedAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public CoordinatesDto Coordinates { get; set; } = new();
    public string? ErrorMessage { get; set; } 
}

// Coordinates extracted from geocoding
public class CoordinatesDto
{
    public double Lat { get; set; }
    public double Lng { get; set; }
}









