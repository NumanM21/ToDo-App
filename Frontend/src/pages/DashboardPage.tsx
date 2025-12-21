import Navbar from '../components/Navbar';

function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar at top */}
            <Navbar />

            {/* Main content */}
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">My Tasks</h1>

                {/* Placeholder - we'll add task list next */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-gray-600">Task list place holder</p>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;