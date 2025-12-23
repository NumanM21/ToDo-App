using Microsoft.AspNetCore.Mvc; // For controller base classes and attributes
using GoogleApi; // Google Maps SDK main class
using GoogleApi.Entities.Common.Enums; // Status enums (Ok, InvalidRequest, etc.)
using GoogleApi.Entities.Maps.Geocoding.Address.Request; // Request object for geocoding
using Microsoft.Extensions.Configuration;
using ToDoList.Api.Models;

// Controller to handle Geocoding and Location validation - Moved from frontend to backend (more secure as API key hidden)
namespace ToDoList.Api.Controllers;

[ApiController]
[Route("api/[controller]")] // /api/location
public class LocationController : ControllerBase
{
    // Dependencies
    private readonly IConfiguration _configuration;

    public LocationController(IConfiguration config)
    {
        _configuration = config;
    }

    // Validate location string via Google geocoding API -- Convert User input (london) to standardised format ("London, UK") 
    [HttpPost("validate")] // Post - /api/location/validate
    public async Task<ActionResult<ValidatedLocationDto>>
        ValidateLocation([FromBody] ValidateLocationDto dto) // FromBody - read req body JSON to get user input DTO
    {
        // Input Validation
        var locationString = dto.Location?.Trim();

        // Safety check - check if null or empty
        if (string.IsNullOrWhiteSpace(locationString))
        {
            // Return 400 - with error detail
            return BadRequest(new ValidatedLocationDto()
            {
                Valid = false,
                ErrorMessage = "Location cannot be empty"
            });
        }

        // Get API Key from configuration
        var apiKey = _configuration["GoogleMaps:ApiKey"];

        // Safety Check - ensure we have A key
        if (string.IsNullOrEmpty(apiKey))
        {
            // debugging log
            Console.Error.WriteLine(
                "ERROR: Google Maps API key NOT found in configuration in backend"); // What WE will see!

            // Return 500 (server side error not client)
            return StatusCode(500, new ValidatedLocationDto()
            {
                Valid = false,
                ErrorMessage =
                    "Location validation service unavailable" // What USER will see - so keep GENERIC (security)
            });
        }

        // Build Google Geocoding API Request
        //// AddressGeocodeRequest - Google SDS's request class
        var request = new AddressGeocodeRequest
        {
            // API Key to authenticate me (server)
            Key = apiKey,

            // Address to geocode (User's input)
            Address = locationString
        };

        // Call Google Geocode API
        try
        {
            //.AddressGeocode.Geocode.QueryAsync() -- ACTUAL call to Google's API - HTTP req to -> https://maps.googleapis.com/maps/api/geocode/json
            var response = await GoogleMaps.Geocode.AddressGeocode.QueryAsync(request);

            // Check API Response status - error handling
            // response.Status - Google's status code
            // Status.Ok - equivalent to "OK" in JSON response
            // Status.ZeroResults - no location found
            // Status.InvalidRequest - bad input
            // Status.RequestDenied - API key issue or quota issue
            if (response.Status != Status.Ok)
            {
                // Error handle most COMMON response status
                var errorMessage = response.Status switch
                {
                    Status.ZeroResults => "Location not found. PLease check spelling and try: City, Country",
                    Status.RequestDenied => "Location service unavailable",
                    Status.InvalidRequest => "Invalid location format",
                    _ => $"Geocoding Failed: {response.Status}"
                };

                // Return 400 with error message to client
                return BadRequest(new ValidatedLocationDto
                {
                    Valid = false,
                    ErrorMessage = errorMessage
                });
            }

            // Extract DATA from response

            // Google returns array - sorted vua relevance (.FirstorDefault() - most relevant result for us)
            var result = response.Results?.FirstOrDefault();

            // Extract City and Country from Address Components
            ////  Google returns .AddressComponents like -> [{ LongName: "Paris", Types: ["locality", "political"] },]

            // Extract City -> AddressComponentType.Locality -> Goggle's enum for city
            var cityComponent =
                result.AddressComponents?.FirstOrDefault(c => c.Types.Contains(AddressComponentType.Locality));

            // Extract Country -> AddressComponentType.Country - Google's enum for country
            var countryComponent =
                result.AddressComponents?.FirstOrDefault(c => c.Types.Contains(AddressComponentType.Country));

            // Extract actual names (long names) -> use ?. to prevent error, instead we let null get thrown and populate with empty string
            var city = cityComponent?.LongName ?? "";
            var country = countryComponent?.LongName ?? "";

            // Validate Required Data Exists
            if (string.IsNullOrEmpty(city) || string.IsNullOrEmpty(country))
            {
                return BadRequest(new ValidatedLocationDto
                {
                    Valid = false,
                    ErrorMessage = "Could not determine city or country. Please enter: City, Country"
                });
            }

            // Build and return success response

            // Create VALIDATED location DTO
            var validatedLocation = new ValidatedLocationDto
            {
                Valid = true,
                FormattedAddress = result.FormattedAddress,
                City = city,
                Country = country,
                Coordinates = new CoordinatesDto
                {
                    Lat = result.Geometry.Location.Latitude,
                    Lng = result.Geometry.Location.Longitude
                }
            };

            // Return 200 (OK) with validated data
            return Ok(validatedLocation);
        }
        catch (Exception e)
        {
            // Error Handling
            // - Network issues
            // - Google API down
            // - JSON parsing errors
            // - Rate limit exceeded
            
            // Debugging error log
            Console.Error.WriteLine($"Geocoding error: {e.Message}");
            
            // Return 500 Internal server error - with generic error message to client
            return StatusCode(500, new ValidatedLocationDto
            {
                Valid = false,
                ErrorMessage = "Location validation failed. Please try again."
            });
        }
    }
}

