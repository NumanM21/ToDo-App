// Container for ALL tasks
import type {Task} from '../types/types';
import { Trash2 } from 'lucide-react';

// Props interface -- what data this component receives
interface TaskItemProps{
    task: Task;             // The task to display
    onToggleComplete: (id:number) => void;      // Function to mark task as complete
    onDelete: (id:number) => void;             // Function to delete task
    onCancel: (id:number) => void;
}


function TaskItem({task, onToggleComplete, onDelete, onCancel}: TaskItemProps){
    // Format date to string we can read (.toLocaleDate...(en-GB) -> UK date format -- new Date () changes string to Date
    const formattedDate = new Date(task.createdAt).toLocaleDateString('en-GB');

    return (
        <div className={`p-4 rounded-lg shadow-md mb-3 relative ${
            task.isComplete
                ? 'bg-white border-l-[16px] border-green-500'   // green border
                : task.isCancelled
                    ? 'bg-white border-l-[16px] border-red-500'     // red border
                    : 'bg-white border-l-[16px] border-blue-500'    // blue border 
        }`}>
            {/* Delete bin icon - top right */}
            <button
                onClick={() => onDelete(task.id)}
                className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-xl"
                title="Delete task"
            >
                <Trash2 size={20}/>
            </button>

            {/* Task content */}
            <div className="justify-end">
                {/* Task header */}
                <h3 className={`text-lg font-semibold mb-2 ${
                    task.isComplete ? 'line-through text-gray-500' : 'text-gray-800'
                }`}>
                    {task.header}
                </h3>

                {/* Task body */}
                {task.body && (
                    <p className={`mb-2 ${
                        task.isComplete ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                        {task.body}
                    </p>
                )}

                {/* Metadata */}
                <div className="flex gap-4 text-sm text-gray-500 mb-3">
                    <span>Created: {formattedDate}</span>

                    {task.completedTargetDate && (
                        <span>
                            Due: {new Date(task.completedTargetDate).toLocaleDateString('en-GB')}
                        </span>
                    )}

                    {task.isComplete && (
                        <span className="text-green-600 font-semibold">✓ Complete</span>
                    )}
                    {task.isCancelled && (
                        <span className="text-red-600 font-semibold">✗ Cancelled</span>
                    )}
                </div>

                {/* Action buttons - bottom right */}
                <div className="flex gap-2 justify-end">
                    {/* Complete button - only show if not cancelled */}
                    {!task.isCancelled && (
                        <button
                            onClick={() => onToggleComplete(task.id)}
                            className={`px-4 py-2 rounded text-sm font-medium ${
                                task.isComplete
                                    ? 'bg-gray-400 text-white hover:bg-gray-500'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                        >
                            {task.isComplete ? 'Undo' : 'Complete'}
                        </button>
                    )}

                    {/* Cancel button - only show if not cancelled */}
                    {!task.isCancelled && (
                        <button
                            onClick={() => onCancel(task.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600"
                        >
                            Cancel
                        </button>
                    )}

                    {/* Restore button - only show if cancelled */}
                    {task.isCancelled && (
                        <button
                            onClick={() => onCancel(task.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600"
                        >
                            Restore
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TaskItem;
    
    
    
    

