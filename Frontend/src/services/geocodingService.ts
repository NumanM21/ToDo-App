import type {GeocodeResponse, ValidatedLocation} from '../types/types';

//// Google Geocoding Service -- Convert locations strings to Co-ordinates and VALIDATE format!


// Validate location string using Google Geocoding API -- ensure user entered a valid City and Country
//// Param locationString -> The user input. <ValidatedLocation> -> object with co-ordinates or errors
export const validateLocation = async (locationString: string): Promise<ValidatedLocation> => {
    // Input validation -- .trim() to remove white spaces (from start and end)
    const trimmedLocation = locationString.trim();

    // Check if input empty - return invalid result with error message ('' return falsy)
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

    // Get API Key from environment
    //// import.meta.env - Vite's way to access env variables (pull key)
    const apiKey = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY;

    // Error handling - ensure API Key exists
    if (!apiKey) {
        console.error('Google Geocoding API Key not found in .env');
        return {
            valid: false,
            formattedAddress: '',
            city: '',
            country: '',
            coordinates: {lat: 0, lng: 0},
            errorMessage: 'Configuration error: API Key missing'
        };
    }

    // Build API Request URL
    //// encodeURIComponent() - converts "London, UK" to "London%2C%20UK" (URL can't have space) - %2C (Comma) %20 (Space)
    const encodedLocation = encodeURIComponent(trimmedLocation);

    // Construct Google Geocoding API URL 
    //// Where we sent a request to -- Base URL + Parameters (our location string + api key)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;

    // Call Google Geocoding API
    try {
        // fetch() - browser API for HTTP requests
        const response = await fetch(url);

        // Error handling for failed request
        if (!response.ok)
            throw new Error(`Geocoding API error: ${response.status}`);

        // Parse JSON body - GeocodeResponse (TS Type assertion - so we know the structure)
        const data = await response.json() as GeocodeResponse;

        // Check API Response status
        // data.status values:
        // "OK" = success
        // "ZERO_RESULTS" = location not found
        // "INVALID_REQUEST" = malformed request
        // "REQUEST_DENIED" = API key issue
        // "OVER_QUERY_LIMIT" = too many requests
        if (data.status !== 'OK') {
            return {
                valid: false,
                formattedAddress: '',
                city: '',
                country: '',
                coordinates: {lat: 0, lng: 0},
                errorMessage: data.status === 'ZERO_RESULTS' ?
                    'Location not found. please check spelling and try: City, Country' :
                    `Geocoding failed: ${data.status}`
            };
        }

        // Extract data from response
        //// data.results[] - take BEST match from Google -- Google return several matches (sorted by relevance)
        const result = data.results[0];

        // Take co-ordinates !
        const {lat, lng} = result.geometry.location;

        // Take formatted address (Google's standardised format)
        const formattedAddress = result.formatted_address;

        //  Extract City and Country
        //// address_component is an array object -> { long_name: "London", types: ["locality", "political"] }
        //// .find() -> search array for first match -- to 'locality' type
        // City
        const cityComponent = result.address_components.find(
            component => component.types.includes('locality'));

        // Country
        const countryComponent = result.address_components.find(
            component => component.types.includes('locality'));

        // Take out actual names (?. optional chaining -> returns undefined rather than error ) - Can combine with || to set to empty string if undefined (fallback)
        const city = cityComponent?.long_name || '';
        const country = countryComponent?.long_name || '';

        // Validate we have required data
        //// Check we have BOTH city and country
        if (!city || !country) {
            return {
                valid: false,
                formattedAddress: '',
                city: '',
                country: '',
                coordinates: {lat: 0, lng: 0},
                errorMessage: 'Either City or Country not defined. Please enter: City, Country'
            };
        }

        // Return Validated Result
        return {
            valid: true,
            formattedAddress,
            city,
            country,
            coordinates: {lat, lng}
        };
    } catch (error) {
        console.error('Geocoding validation error: ', error);
        
        return{
            valid: false,
            formattedAddress: '',
            city: '',
            country: '',
            coordinates: {lat:0,lng:0},
            errorMessage: 'Unable to validate location.'
        };
    }
};
    

