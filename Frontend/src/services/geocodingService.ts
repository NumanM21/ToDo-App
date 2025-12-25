import axios from 'axios'; // Axios for HTTP Request to backend -> HTTP Client library (like fetch) but better since .data is already parsed (don't need .json())
import type {ValidatedLocation} from "../types/types.ts";

//// Location Validation Service -> Call backend -> call Googles Geocoding API -> returns validatedDto  (co-ordinates) to us
// Param -> string from user input -  Return -> Object with coordinates or error

export const validateLocation = async (locationString: string): Promise<ValidatedLocation> => {
    // User input validation
    const trimmedLocation = locationString.trim();

    // Return early if invalid -> No need to waste API call 
    if (!trimmedLocation) {
        return {
            valid: false,
            formattedAddress: '',
            city: '',
            country: '',
            coordinates: {lat: 0, lng: 0},
            errorMessage: 'Location cannot be empty'
        };
    }

    // Call backend API
    try {
        // axois.post() -> Makes HTTP POST request - param1 (URL to our backend endpoint) - param2 (request body - data we are sending)
        const response = await axios.post('http://localhost:5193/api/location/validate', {
            Location: trimmedLocation
        });

        // Process backend response (Extract and return Validated Data to caller -> RegisterPage)
        //// Backend returns validatedLocationDto (response.data) - Matches our ValidatedLocation in types class 

        return {
            valid: response.data.valid,
            formattedAddress: response.data.formattedAddress,
            city: response.data.city,
            country: response.data.country,
            coordinates: {
                lat: response.data.coordinates.lat,
                lng: response.data.coordinates.lng
            },
            errorMessage: response.data.errorMessage
        };
    } catch (error: any) {
        // Error handling 
        // - Network errors (backend not running, no internet)
        // - Backend returning 400/500 error status codes
        // - JSON parsing errors
        // - Timeout errors

        // Debug error log -> Can view in browser console
        console.error('Location validation error: ', error);

        // Extract Error message (from backend if it returned one, else default to generic message)  => USER will see this!
        const errorMessage = error.response?.data?.errorMessage || 'Unable to validate location. Please try again';

        // Return validation error with error message
        return {
            valid: false,
            formattedAddress: '',
            city: '',
            country: '',
            coordinates: {lat: 0, lng: 0},
            errorMessage: errorMessage
        };
    }
};

