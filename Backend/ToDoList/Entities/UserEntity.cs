
namespace DefaultNamespace;


public class UserEntity
{
    public int Id { get; set; };
    public string FirstName { get; set; };
    public string LastName { get; set; };
    public string Email { get; set; };
    public string PasswordHash { get; set; };
    public string Location { get; set; };
    public DateOnly CreatedAt { get; set; };
}