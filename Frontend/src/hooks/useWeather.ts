import {useState, useEffect} from 'react';    // React hooks for state and side effects
// Services for API calls
import {validateLocation} from '../services/geocodingService';
import {getWeatherByCoordinates} from '../services/weatherService';
import type {WeatherData} from '../types/types';      // TypeScript types

// Custom React Hook -> fetch weather data from user's location - handle loading, error states and manage refreshing

// Returns object containing weather data, loading state and error state
export const useWeather = () => {

    // State management 

    // Weather data state - if null (not loaded yet)
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Loading state - true if still fetching (loading)
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Error state 
    const [error, setError] = useState<string | null>(null);

    // Effect -> Fetch Weather on Component Mount(page load)

    // useEffect - runs after component mounts -- [] dependency array (runs only once on mount)
    useEffect(() => {

        // Inner ASYNC method (function) -- useEffect CAN'T be async!
        const fetchWeather = async () => {

            // Get User location from localStorage

            try {
                // Get user detail we cached during reg (/login)
                const userJson = localStorage.getItem('user');

                // Error handling
                if (!userJson) {
                    setError('User location not found');
                    setIsLoading(false);
                    return;
                }

                // JSON.parse -> Converts string to (JavaScript) object!
                const user = JSON.parse(userJson);

                // Get location from user object
                const location = user.location;

                

                // Error handling 
                if (!location) {
                    setError('No location set for user');
                    setIsLoading(false);
                    // debugging:
                    console.log('Location object: ', location, ' User object: ', user);
                    return;  
                }

                
                // Geocode Location (string) to get Coordinates (lat and lng)

                // Call backend validateLocation (api/location/validate) -> which calls Google's Geocode API and returns object
                const locationResult = await validateLocation(location);
                
                // Error handling
                if (!locationResult.valid) {
                    setError(locationResult.errorMessage || 'Could not validate location');
                    setIsLoading(false);
                    return;
                }
                
                // Extract coordinates
                const {lat, lng} = locationResult.coordinates;
                
                // Fetch Weather Data using Coordinates
               
                // Call OpenWeatherMapi API with coordinates - returns weatherData object or null
                const weatherData = await getWeatherByCoordinates(lat, lng);
               
                // Error handling
                if (!weatherData) {
                    setError('Could not fetch weather data');
                    setIsLoading(false);
                    return;
                }

                // Got our weather data now -> update our state on hook

                // Set new weather data (will trigger re-render of page)
                setWeather(weatherData);

                // Clear previous error logs
                setError(null);

                // Stop loading spinner
                setIsLoading(false);
            } catch (error: any) {
                // Error handling - Catch any error we didn't account for

                console.error('Weather fetch error: ', error);

                // Error message to display to user
                setError('Failed to load weather');

                setIsLoading(false);
            }
        };

        // Call ASYNC function we just created -> Will trigger the weather fetch process
        fetchWeather();

        // Auto-refresh every hour (better short interval, but limited API calls)
        const interval = setInterval(fetchWeather, 60 * 60 * 1000); // 1000 as setInterval takes it in miliseconds
        return () => clearInterval(interval); // cleanup on unmount

    }, []);

    // Return Hook result - Our object with weather data and states

    // Components use this hook can destructure ( const {weather, isLoading, error} = useWeather(); )

    return {
        weather,
        isLoading,
        error
    };
};
