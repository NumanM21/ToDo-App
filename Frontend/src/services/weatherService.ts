import type { WeatherResponse, WeatherData } from '../types/types';

// OpenWeatherMap API Service -- Fetch current weather data using coordinates we got from geocodingService

export const getWeatherByCoordinates = async (
    lat: number,
    lng: number
): Promise<WeatherData | null> => {

    // Get API Key form Environment
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

    // Check API Key exists 
    if (!apiKey) {
        console.error('OpenWeatherMap API Key not found in .env');
        return null; // null to indicate failure
    }

    // Build API Request URL
    //// OpenWeatherMap API endpoint for current weather - Base URL
    const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

    // Build query parameters in final URL we send 
    //// Lat & lng (API uses lon NOT lng) - units=metric (get temp in Celsius not F)
    const url = `${baseUrl}?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    // Call OpenWeatherMap API
    try {
        // HTTP req using fetch
        const response = await fetch(url);

        // Check response -- error handling
        if (!response.ok) {
            console.error(`Weather API error: ${response.status}`);
            return null;
        }

        // Parse JSON - Type assertion (as type) -- Tells TS this matches WeatherResponse structure
        const data = await response.json() as WeatherResponse;

        // Process and Return Weather Data
        //// Call helper function to transform API response to simplified format (what we need) -- Helps with future testing!
        return processWeatherData(data);
    } catch (error) {
        // Catch any errors: 
        // - No internet connection
        // - API is down
        // - Invalid JSON response
        // - CORS issues
        console.error('Error fetching weather data:', error);
        return null;
    }
};

// Helper Function - Process Weather Data
//// Extracts field we need to simplified WeatherData format - we can then display those fields
//// Param -> Raw API response from WeatherResponse -- Returns WeatherData
function processWeatherData(data: WeatherResponse): WeatherData {

    // Extract Temperature Data
    //// data.main contains all temp metrics -- round to whole number for cleaner display (5.7 -> 6)

    const temperature = Math.round(data.main.temp); // current temp
    const minTemp = Math.round(data.main.temp_min);
    const maxTemp = Math.round(data.main.temp_max);

    // Extract Weather Description
    //// data.weather is an array (multiple conditions) -- take first one!
    const description = data.weather[0]?.description || 'N/A';

    // Capitalise first letter (better UI) - .charAt(0) (gets first letter - .toUpperCase - .slice(1) - get rest of string from index  1 and adds to our capitalised first letter!
    const capitalisedDescription = description.charAt(0).toUpperCase() + description.slice(1);

    // Extract Weather Icon code
    //// Format - XXY where XX = condition (number) and Y = d (day) or n (night) --- 01d (clear sky day)
    const icon = data.weather[0]?.icon || '01d';

    // Extract Location Name
    //// data.name - to confirm we got the right place from API
    const location = data.name;

    // Return Processed Data
    return {
        temperature,
        minTemp,
        maxTemp,
        description: capitalisedDescription,
        icon,
        location
    };
}

// Helper Function - Get Weather Icon URL
//// Converts OpenWeatherMap API icon code to full image url -- Param icon code -- returns URL to weather icon image we display
export const getWeatherIconUrl = (iconCode: string): string => {
    // @2x = high resolution (2x size) 
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};