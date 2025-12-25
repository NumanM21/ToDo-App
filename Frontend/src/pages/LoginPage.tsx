// React hooks - function that add state and lifecycle to components
import {useState} from 'react';
// Navigation hook - allows programmatic navigation (basically redirect)
import {useNavigate, Link} from 'react-router-dom';
// Import our API service I created
import {authAPI} from '../services/api';
// Import TS Type I made - 'type' keyword if for TS IDE to pick up - not compiler!
import type {LoginCredentials} from '../types/types';
import * as React from "react";


function LoginPage() { // The actual component (function)

    ///// States

    // useState - hook which creates a piece of state (data that can change and triggers re-render on change)
    // useState<> - Will match LoginCredentials shape -- Initial values set to '' -- returns array [currVal, functionToUpdateVal]
    // const [credentials, setCredentials] - Destructuring (unpack arr/obj into individual values)
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    });

    // state for error msg - can be either string or null (null on initial state)
    const [error, setError] = useState<string | null>(null);

    // state for loading indicator - true - loading - false - not loading
    const [isLoading, setIsLoading] = useState<boolean>(false);

    ////// Hooks

    // useNavigate hook - returns a function to navigate to different routes (similar to Response.Redirect() in C#)
    const navigate = useNavigate();

    // handles input change - When user types into fields -- event:React... -- event object from input change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // event.target - input element that triggered the event
        // event.target.name - 'email' or 'password' (like key)
        // event.target.value - actual text in the input field 
        const {name, value} = event.target;

        // Update credentials state - [name]: value -- dynamic key (updates whichever of email or password with new value)
        // ...prev - spread existing credentials - only update what [name] IS, everything else remains the same!
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission - Event:React.FormEvent - event object from form  submit
    const handleSubmit = async (event: React.FormEvent) => {
        // Prevent default form behaviour (page reload automatically without this)
        event.preventDefault();
        // Clear previous error messages
        setError(null);
        // Set loading to true - can use boolean to display loading UI
        setIsLoading(true);

        // Error handling 
        try {
            // Call login api - returns {token, userId, email, firstName} - await since we used promise!
            const response = await authAPI.login(credentials);
            // Store token in browser's localStorage - data persists in browser after it has been closed
            localStorage.setItem('token', response.token);
            // Store user info as JSON string - JSON.Stringify (coverts objects to JSON string) - localStorage ONLY stores strings!
            localStorage.setItem('user', JSON.stringify({
                userId: response.userId,
                email: response.email,
                firstName: response.firstName,
                location:  response.location
            }));

            // User now logged in - navigate to dashboard
            navigate('/dashboard');
        } catch (error: any) {
            // Catch any error - typically if API call fails (network err, 401...)

            // setError - displays message to user -- err.response.data.message - try to pull error from backend (? since it can be undefined which would be returned)
            //  Have 'Invalid Email or Password as 'fallback' (since error = any)
            setError(error.response?.data?.message || 'Invalid Email or Password');
        } finally {
            setIsLoading(false);
        }

        ///// Render/ JSX

        // Return what to display on screen - JSX (JS XML - Allows us to write HTML-like code but using JS

    };
    return (
        // className - like HTML class attribute

        <div className="min-h-screen bg-gray-300 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
                {/* Conditional rendering -- condition (error) && element -> ONLY show element IF condition is true (if error null - nothing render, if error string - div renders)*/}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {/* Display error message*/}
                        {error}
                    </div>
                )}
                {/* Form - onSubmit={handleSubmit} --> When form submits, calls handleSubmit function*/}
                <form onSubmit={handleSubmit}>

                    {/* Email field*/}
                    <div className="mb-4">
                        {/* Label - htmlFor --> connects label to input*/}
                        <label htmlFor="email" className="block text-gray-700 mb-2">
                            Email
                        </label>

                        {/* Input*/}
                        <input
                            type="email"     // HTML5 email Verification 
                            id="email"       // matches label's htmlFor
                            name="email"     // used in handleChange (target.name)
                            value={credentials.email}     // Controlled input (React manages values)
                            onChange={handleChange}       // Call handleChange on every keystroke (I/O)
                            required           // HTML5 required validation
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Password Field*/}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"       // Hides typed characters
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}   // handleChanges uses event.target.name to know which field to update (hence all are PASSWORD!)
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Submit button*/}
                    <button
                        type="submit"     // Triggers form onSubmit
                        disabled={isLoading}  // Disable while loading
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {/* Conditional Rendering - shows text based on isLoading*/}
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Link to register page*/}
                <p className="mt-4 text-center text-gray-800">
                    Don't have an account?{' '}
                    {/* Link component from React Router - like <A> but DOESN'T reload the page. to="/register" -- navigate to /register route */}
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}


export default LoginPage;