import axios from "axios";
import type {AuthResponse, LoginCredentials, RegisterCredentials, Task} from "../types/types";


// Base URL for my backend
const API_BASE_URL = import.meta.env.PROD  ?
    'https://todolist-backend-nm-hwfehugmh8g3f5gg.ukwest-01.azurewebsites.net/api' : // Runs on 'npm run build'
    'http://localhost:5193/api'; // Runs on 'npm run dev'

// Create Axios instance // similar ti creating a configured HttpClient in C#
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {  // Default header for every request
        'Content-Type': 'application/json',  // Tells server we're sending json
    },
});
// Interceptor - Middleware that runes BEFORE every request (for all outgoing request)
// Interceptor - add token to every request automatically
api.interceptors.request.use((config) => {
    // Config - the request configuration object set up above - gets used in our request
    
    // Get JWT from  browser's localStorage -- localStorage.getItem() returns string or null
    const token = localStorage.getItem('token');
    
    // token = true if user is logged in
    if (token) {
        // Add bearer token to our authorisation header on this req  
        config.headers.Authorization = `Bearer ${token}`; // `` Template Literal - string interpolation  
    }
    // Get our modified config with token added to header - This gets sent to server
    return config;
});
// Export makes this accessible  in other files 
// Authenticate API calls
export const authAPI = { // export an object named authAPI containing auth-related functions
    // Property - Login - Value - Async arrow function - returns a Promise (C# Task but in JS)
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        // Credentials - Parameter with type annotation - Promise - return type (resolves to  AuthResponse
        // Axios automatically JSON.Stringifies the credentials object
        // api.post - POST request to url with credentials as body
        const response = await api.post('/auth/login', credentials);
        // Axios automatically JSON.Stringifies the credentials object
        // response.data retrieves only data from http body
        return response.data; 
    },
    
    register: async (data: RegisterCredentials): Promise<AuthResponse> =>{
        const response = await api.post('/auth/register', data);
        return  response.data;
    },
};


//// Export const TaskAPI = {several properties (methods) in one object -- JS specific -- Similar to static class in C# - TaskAPI is the object - getAll, getById are properties}

// Task API calls
export const TaskAPI = {   
    // No param needed - token identifies user (logged in user) - Promise return Array of Tasks
    getAll: async (): Promise<Task[]> => {
        const response = await api.get('/tasks');
        return response.data;
    },
    
    getById: async (id:number): Promise<Task> => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },
    // Omit <> - TS Utility type (Task interface (new type created) without the specified fields we put inside) - Backend generates those 3 so we don't need to!
    create: async (task:Omit<Task,'id' | 'userId' | 'createdAt'>): Promise<Task> => {
        const response = await api.post('/tasks', task);
        return response.data; // Back returns created task with the 3 omitted field!
    },
    // Partial<> - TS Utility type -- Task interface, but all properties are optional 
    update: async (id:number, task: Partial<Task>) => {
        // Body we pass is {id,...task} -- This ... is an object spread syntax (spreads all properties of task object)
        const response = await api.put(`/tasks/${id}`, {id, ...task});
        return response.data;
    },
    
    delete: async (id:number): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },
};
    
