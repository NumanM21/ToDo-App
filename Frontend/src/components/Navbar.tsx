import { useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    // Get user info from localStorage - .getItem returns a string so we parse as JSON to pull the specific 'key' out
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // Logout function
    const handleLogout = () => {
        // Clear AUTH data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md mb-6">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Left: App name */}
                <h2 className="text-xl font-bold text-gray-800">
                    To-Do List 
                </h2>

                {/* Right: User info + logout */}
                <div className="flex items-center gap-4">
                    {/* Display user's first name */}
                    <span className="text-gray-600">
                        Welcome, {user?.firstName || 'User'}!
                    </span>

                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;