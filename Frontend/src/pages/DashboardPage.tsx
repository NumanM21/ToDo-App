import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TaskItem from '../components/TaskItem';
import CreateTaskForm from '../components/CreateTaskForm';
import { TaskAPI} from '../services/api';
import type { Task } from '../types/types';

function DashboardPage() {
    
    // State for tasks
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch tasks when component mounts - useEffect (runs after component mounts) - [] (dependency array) -- Runs ONCE on mount
    useEffect(() => {
        fetchTasks();
    }, []);
    
    // Function to GET ALL tasks
    const fetchTasks = async  () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call API - token added by interceptor (does it auto)
            const data = await TaskAPI.getAll();

            // Update state with FETCHED tasks
            setTasks(data);
        } catch (error: any) {
            console.error('Error fetching tasks', error);
            setError('Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Function to CREATE
    const handleCreateTask = async (taskData: {
        header: string;
        body?: string;
        completedTargetDate?: string;
    }) => { 
        // Call API to create new task
        const newTask = await TaskAPI.create({
            header: taskData.header,
            body: taskData.body,
            isComplete: false,
            isCancelled: false,
            completedTargetDate: taskData.completedTargetDate,
        });
        
        // Add new task to STATE (add to beginning of tasks list (prepend to start))
        setTasks([newTask, ...tasks]);
    };
    
    // Function to TOGGLE task completion 
    const handleToggleComplete = async (id:number) => {
        // Find task we want to mark as complete
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            // Call API to update
            await TaskAPI.update(id, {
                isComplete: !task.isComplete
            });

            // Update state - map creates new array with updated task -- .map returns a new array in React -- each item needs UNIQUE key prop (React Diffing algorithm)
            setTasks(tasks.map(x => x.id === id ? {...x, isComplete: !x.isComplete} : x));
        } catch (error) {
            console.error('Error updating task: ', error);
            alert('Failed to update task');
        }
    };
    
    // Function to Cancel/Restore a task
    const handleCancel = async (id: number) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            // Toggle cancelled status
            await TaskAPI.update(id, {
                isCancelled: !task.isCancelled
            });

            // Update state
            setTasks(tasks.map(t =>
                t.id === id ? { ...t, isCancelled: !t.isCancelled } : t
            ));
        } catch (err) {
            console.error('Error cancelling task:', err);
            alert('Failed to cancel task');
        }
    };
    
    // Function to delete a task
    const handleDelete = async (id:number) => {
        // Confirm deletion
        if (!confirm('Are you sure want to delete this task?')) return;
        
        try {
            // Call delete API
            await TaskAPI.delete(id);
            
            // Remove from state - filter creates new array without deleted task -- Can't UPDATE current state, need to RE-CREATE state (Re-render ONLY if state ref changes)
            setTasks(tasks.filter(x => x.id !== id));
        } catch (error) {
            console.error('Error deleting task: ', error);
            alert('Failed to delete task');
        }
    };



    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">My Tasks</h1>

                {/* Create task form */}
                <CreateTaskForm onCreateTask={handleCreateTask} />

                {/* Loading state */}
                {isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading tasks...</p>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Task list */}
                {!isLoading && !error && (
                    <div>
                        {tasks.length === 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <p className="text-gray-600">
                                    No tasks yet. Create your first task above!
                                </p>
                            </div>
                        ) : (
                            <div>
                                {/* Map over tasks array and render TaskItem for each */}
                                {tasks.map(task => (
                                    <TaskItem
                                        key={task.id}  // React needs unique key for lists
                                        task={task}
                                        onToggleComplete={handleToggleComplete}
                                        onDelete={handleDelete}
                                        onCancel={handleCancel}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;