//  user from login/register response
export interface User {
    userId: number;
    email: string;
    firstName: string;
    location: string;
}

// Auth response from backend
export interface AuthResponse {
    token: string;
    userId: number;
    email: string;
    firstName: string;
    location: string;
}

// Task Entity
export interface Task {
    id: number;
    userId: number;
    header: string;
    body?: string;
    isComplete: boolean;
    isCancelled: boolean;
    completedTargetDate?: string;
    createdAt: string;
}

// Login form data
export interface LoginCredentials {
    email: string;
    password: string;
}

// Register form data
export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    location:string;
}

// Google Geocoding API  
//// Takes response from Google API call (a location string) and convert to co-ordinates
export interface GeocodeResponse {
    // Array of res (Google may return multiple matches)
    results: {
        // Google standardised address format ("London, UK")
        formatted_address: string;

        // Breakdown of address components (City,Country,Postal code...)
        address_components: {
            long_name: string;  // Full name (United Kingdom)
            short_name: string; // Abbreviation (UK)
            types: string[];    // Component type (["Country", "Political"])
        }[];

        // Geographic Co-ordinates -- lat lng is how Google return
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }[];

    // API Responses - OK (success) - Zero_result (location not found) - Invalid_Request (bad input)
    status: string;
}

// Validate Location Data after geocoding 
////  What we use in actual app
export interface ValidatedLocation{
    valid: boolean;     // True if location found AND valid
    formattedAddress: string;       
    city: string;      
    country: string;    // Not abbreviation (long name)
    coordinates: {
        lat: number;
        lng: number;
    };
    errorMessage?: string;   
}

// Response from OpenWeatherMap API
//// Contains current weather data
export interface WeatherResponse{
    // Main weather  metrics we may use
    main: {
        temp: number;       // In Celsius
        temp_min: number;
        temp_max: number;
        feels_like: number;
        humidity: number;   // Percentage value (0-100)
        pressure: number;   // Atmospheric pressure
    };
    
    // Weather conditions - multiple to accomodate many
    weather: {
        id: number;     // Unique ID to identify each condition
        main: string;   // Group it belongs to (cloudy, rainy, clear)
        description: string;    
        icon: string;   
    }[];
    
    // Location name from API
    name: string;
}

// Processed Weather Data to display in UI
//// Simplified interface (easier to implement for UI)
export interface WeatherData{
    temperature: number;
    minTemp: number;
    maxTemp: number;
    description: string;
    icon: string;
    location: string;
}










