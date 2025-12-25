import React from 'react';  // React for component creation 
import { useWeather } from '../hooks/useWeather';   // Custom hook for weather data
import { getWeatherIconUrl } from '../services/weatherService';     // Helper function to get weather icon URL

// Weather Widget -> Displays current weather with temp range and progress indicator

const WeatherWidget: React.FC = () => {
    
    // Hook - Fetch weather data
    
    // De-structure data from custom hook
    const {weather, isLoading, error} = useWeather();
    
    // Loading state
    
    // Show loader while fetching weather
    if (isLoading) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 border border-blue-500 shadow-lg w-64 animate-pulse">
                {/* Skeleton - animated placeholder */}

                {/* Icon skeleton */}
                <div className="h-16 w-16 bg-gray-700 rounded-full mb-2"></div>

                {/* Temperature skeleton */}
                <div className="h-8 w-20 bg-gray-700 rounded mb-2"></div>

                {/* Description skeleton */}
                <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>

                {/* Location skeleton */}
                <div className="h-4 w-28 bg-gray-700 rounded mb-3"></div>

                {/* Progress bar skeleton */}
                <div className="h-2 w-full bg-gray-700 rounded"></div>
            </div>
        );
    }
    
    // Error state
    
    // Show error message if fetch failed
    if (error) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 border border-red-500 shadow-lg w-64">
                {/* Error icon */}
                <div className="text-red-400 text-4xl mb-2">⚠️</div>

                {/* Error message */}
                <p className="text-red-300 text-sm">{error}</p>

                {/* Retry button */}
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-xs underline"
                >
                    Retry
                </button>
            </div>
        );
    }
    
    // Safety check -> no data state --> We render nothing
    
    if (!weather) return null;
     /*
    // Calculate progress bar position
    
    //// Calculate current temp between min and max - Formula: (current - min) / (max - min) * 100 = percentage
    const tempRange = weather.maxTemp - weather.minTemp;
    const tempProgress = tempRange  > 0 ?
        ((weather.temperature - weather.minTemp) / tempRange) * 100 :
        50; 
    
    // Clamp value between 0-100 (safety check)
    
    const clampedProgress = Math.min(0, Math.min(100, tempProgress));
    //////////////// Commented out as it may be used in the future ////////////////////////////
    */
    // Get Weather Icon URL
    
    // Convert icon code to full URL - weather.icon = "04d" → "https://openweathermap.org/img/wn/04d@2x.png"
    const iconUrl = getWeatherIconUrl(weather.icon);
    
      
    
    // Render Weather Card

    return (
        <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
            {/* space-x-2: horizontal gap between items */}
            {/* bg-white: white background (light theme) */}
            {/* px-3 py-1: small padding (compact) */}
            {/* border-gray-200: subtle border */}
            {/* shadow-sm: small shadow */}

            {/* ================================================================
                WEATHER ICON
                ================================================================ */}

            <img
                src={iconUrl}
                alt={weather.description}
                className="w-10 h-10"
                // w-10 h-10: 40px x 40px (compact size)
            />

            {/* ================================================================
                TEMPERATURE & LOCATION
                ================================================================ */}

            <div className="flex flex-col">
                {/* flex-col: stack vertically */}

                {/* Temperature & Description */}
                <div className="flex items-center space-x-1">
                    {/* Current temperature */}
                    <span className="text-lg font-semibold text-gray-800">
                        {weather.temperature}°C
                        {/* text-lg: medium font size */}
                        {/* font-semibold: semi-bold weight */}
                        {/* text-gray-800: dark gray (readable) */}
                    </span>

                    {/* Weather description */}
                    <span className="text-xs text-gray-800 capitalize">
                        {weather.description}
                        {/* text-xs: extra small font */}
                        {/* text-gray-500: lighter gray */}
                        {/* capitalize: first letter uppercase */}
                    </span>
                </div>

                {/* Location & Temperature Range */}
                <div className="flex items-center space-x-2 text-xs text-gray-800">
                    {/* Location */}
                    <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{weather.location}</span>
                    </div>

                    {/* Temperature range (compact) */}
                    <span className="text-gray-400">•</span>
                    <span>
                        {weather.minTemp}° - {weather.maxTemp}°
                        {/* Simple range: "2° - 8°" */}
                    </span>
                </div>
            </div>
        </div>
    );
};
    
export default WeatherWidget;














