using Microsoft.EntityFrameworkCore;
namespace ToDoList.Api.Data;
using ToDoList.Api.Models;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    // DbSet - One per entity - Represents our tables 
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<TaskEntity> Tasks { get; set; }
    
    // Config for our relationships/ constrains within each table and between them
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(k => k.Id); // PK
            entity.HasIndex(k => k.Email).IsUnique();
            entity.Property(k => k.Email).IsRequired();
            entity.Property(k => k.FirstName).IsRequired();
            entity.Property(k => k.LastName).IsRequired();
        });
        
        // Task

        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.HasKey(k => k.Id); // PK

            // Define the 1-to-many relationship
            entity.HasOne(t => t.User) // TASK has one user - Navigation to User (No column in table)
                .WithMany(x => x.Tasks) // User has many tasks
                .HasForeignKey(k => k.UserId) // FK - Scalar prop - creates column in table
                .OnDelete(DeleteBehavior.Cascade);
        });
        
    }
}