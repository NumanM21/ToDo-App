import {Link, useNavigate} from 'react-router-dom';
import WeatherWidget from './WeatherWidget';    

function Navbar() {
    const navigate = useNavigate();

    // Logout function
    const handleLogout = () => {
        // Clear AUTH data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login
        navigate('/login');
    };

    // Get user's first name from localStorage for display
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const firstName = user?.firstName || 'User';

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ============================================================
                    NAVBAR CONTAINER - 3 SECTIONS
                    ============================================================ */}

                <div className="flex justify-between items-center h-16">
                    {/* h-16: navbar height = 64px (standard) */}
                    {/* justify-between: space items evenly */}
                    {/* items-center: vertically center all items */}

                    {/* ========================================================
                        LEFT: WEATHER WIDGET
                        ======================================================== */}

                    <div className="flex-shrink-0">
                        {/* flex-shrink-0: don't shrink this section */}
                        <WeatherWidget />
                    </div>

                    {/* ========================================================
                        CENTER: APP NAME/LOGO
                        ======================================================== */}

                    <div className="flex-1 flex justify-center">
                        {/* flex-1: take available space */}
                        {/* justify-center: center the app name */}

                        <Link
                            to="/dashboard"
                            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Tasks App NM
                            {/* text-2xl: larger font for prominence */}
                            {/* font-bold: bold weight */}
                            {/* text-blue-600: brand color */}
                            {/* hover:text-blue-700: darker on hover */}
                            {/* transition-colors: smooth color change */}
                        </Link>
                    </div>

                    {/* ========================================================
                        RIGHT: USER INFO & LOGOUT
                        ======================================================== */}

                    <div className="flex items-center space-x-4 flex-shrink-0">
                        {/* space-x-4: gap between greeting and button */}
                        {/* flex-shrink-0: don't shrink this section */}

                        {/* User greeting */}
                        <span className="text-gray-700 font-medium">
                            Hello, {firstName}!
                            {/* font-medium: medium weight */}
                        </span>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                            Logout
                            {/* transition-colors: smooth background change */}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;