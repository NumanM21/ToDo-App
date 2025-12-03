namespace DefaultNamespace;

public class TaskEnttiy
{
    public int Id { get; set; };
    public User UserId { get; set; }; // FK
    public string Header { get; set; };
    public string Body { get; set; };
    public bool IsComplete { get; set; };
    public bool IsCancelled { get; set; };
    public DateOnly CompleteTargetDate { get; set; };
    public DateOnly CreatedAt { get; set; };
}