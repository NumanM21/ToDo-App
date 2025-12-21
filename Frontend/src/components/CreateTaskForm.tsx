import {useState} from 'react';
import * as React from "react";


// Props - JSX attribute passed (incl to its children) as a single object type (and code adheres to defined contract)
interface CreateTaskFormProps{
    onCreateTask: (taskData: {
        header: string;
        body?: string;
        completedTargetDate?: string;
    }) => Promise<void>;
}

function CreateTaskForm({onCreateTask} : CreateTaskFormProps) {
    /// Initial Form state
    const [header, setHeader] = useState('');
    const [body, setBody] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /// Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validate - header is Req
        if (!header.trim()) {   // JS - '', 0, null, undefined are false on default - so if they leave this header input empty -- This false becomes positive meaning they didn't INPUT anything!
            alert('Task title is required');
            return
        }

        setIsSubmitting(true);

        try {
            // Call parent's create function -- only include body/targetDate if they have a value
            await onCreateTask({   // AWAIT since we want to wait until get a res from API - if failed, we display error rather than clearing form THEN seeing error!
                header: header.trim(),
                ...(body.trim() && {body: body.trim()}),
                ...(targetDate && {completedTargetDate: targetDate}),
            });

            // Clear form on success
            setHeader('');
            setBody('');
            setTargetDate('');
        } catch (error) {
            console.error('Error creating task: ', error);
            alert('Failed to create task!');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>

            <form onSubmit={handleSubmit}>
                {/* Task title */}
                <div className="mb-4">
                    <label htmlFor="header" className="block text-gray-700 mb-2">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        id="header"
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                        placeholder="e.g., Buy groceries"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Task description */}
                <div className="mb-4">
                    <label htmlFor="body" className="block text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Add more details..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Target date */}
                <div className="mb-4">
                    <label htmlFor="targetDate" className="block text-gray-700 mb-2">
                        Target Date (Optional)
                    </label>
                    <input
                        type="date"
                        id="targetDate"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
            </form>
        </div>
    );
}
export default CreateTaskForm;