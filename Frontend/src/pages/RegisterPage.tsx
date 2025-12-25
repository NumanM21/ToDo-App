import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import type { RegisterCredentials } from '../types/types';
import { validateLocation } from '../services/geocodingService';

function RegisterPage() {
    // State for form data
    const [formData, setFormData] = useState<RegisterCredentials>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        location: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Location Validation loading state - separate from loading state above 
    const [isValidatingLocation, setIsValidatingLocation] = useState<boolean>(false);

    // Hooks
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        
        // Validate Location with Google Geocoding API
        setIsValidatingLocation(true); 
        
        try {
            // Call GC API to validate location - returns {valid:boolean, formattedAddress: string, coordinates: {}...)
            const locationResult = await validateLocation(formData.location);
            
            // Stop validation spinner -- Have gotten our result back
            setIsValidatingLocation(false);
            
            // Check if location is valid
            if (!locationResult.valid){
                // Show error message from our geocodingService -> and STOP registration here!
                setError(locationResult.errorMessage || 'Invalid Location. Please enter: City, Country');
                return;
            }
            
            // Location Valid - normal registration 
            
            // show main loading spinner
            setIsLoading(true);
            
            // Build registration data with valid location -- formData along with Google's formatted address 
            const registrationData = {
                ...formData,
                location: locationResult.formattedAddress
            }; //TODO could store coordinates from this API call now in cache, for optimising!
            
            // Call register API 
            const response = await authAPI.register(registrationData);
                
            // Registration successful - store Data and redirect
            
            
            // Store JWT token in localstorage 
            localStorage.setItem('token', response.token);
            
            // Store User info in LocalStoreage (for navbar, weather widget, first name displayed)
            localStorage.setItem('user', JSON.stringify({
                userId: response.userId,
                email: response.email,
                firstName: response.firstName,
                location: locationResult.formattedAddress
            }));

            // Navigate to dashboard (user is now logged in)
            navigate('/dashboard');
        } catch (error: any) {
            // Stop both loading states
            setIsValidatingLocation(false);
            setIsLoading(false);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };
    
    // Render /JSX
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Create Account
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* First Name */}
                    <div className="mb-4">
                        <label htmlFor="firstName" className="block text-gray-700 mb-2">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="mb-4">
                        <label htmlFor="lastName" className="block text-gray-700 mb-2">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <label htmlFor="location" className="block text-gray-700 mb-2">
                            Location (City, Country)
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. London, UK"   
                            required
                            disabled={isValidatingLocation} // Disable whilst validating
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                        {/* Show validating message */}
                        {isValidatingLocation && (
                            <p className="text-sm text-blue-600 mt-1">
                                Validating location...
                            </p>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {/* Show different text based on state */}
                        {isValidatingLocation
                            ? 'Validating location...'
                            : isLoading
                                ? 'Creating account...'
                                : 'Register'
                        }
                    </button>
                </form>

                {/* Login link */}
                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;