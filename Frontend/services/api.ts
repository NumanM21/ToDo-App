import axios from "axios";
import {AuthResponse, LoginCredentials, RegisterCredentials, Task} from "../types/types";


// Base URL for my backend
const API_BASE_URL = 'http://localhost:5193/api';

// Create Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor - add token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // `` string interpolation  
    }
    return config;
});

// Authenticate API calls
export const authAPI = {
    // If we call a login? it will pass our credentials using our LoginCredentials method from types and it promises to return an AuthResponse which  we map 
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        // Store the response from our auth/login api endpoint, passing in the credentials as the argument
        const response = await api.post('/auth/login', credentials);
        return response.data; // .data is the axios response field?
    },
    
    register: async (data: RegisterCredentials): Promise<AuthResponse> =>{
        const response = await api.post('/auth/register', data);
        return  response.data;
    },
};

// Task API calls
export const TaskAPI = {
    getAll: async (): Promise<Task[]> => {
        const response = await api.get('/tasks');
        return response.data;
    },
    // How can we have several of these in one export const? Is export const a function call we make, and depending on which method we call  (getAll) it will match to that key? Then call the method for it?
    // is async method type, with id:number the parameter we pass into the api.get request (we pass an id, of type number)
    getById: async (id:number): Promise<Task> => {
        const response = await api.get(`/task/${id}`);
        return response.data;
    },
    // What is the Omit doing here? is that the field we don't want to update/ pass back via our DTO? 
    create: async (task:Omit<Task,'id' | 'userId' | 'createdAt'>): Promise<Task> => {
        const response = await api.post('/task', task);
        return response.data;
    },
    
    update: async (id:number, task: Partial<Task>): Promise<void> => {
        await api.put(`/task/${id}`, {id, ...task}); //  we pass a task with id for our task, then based on that task id, we spread out the task field using the ... ?
    },
    
    delete: async (id:number): Promise<void> => {
        await api.delete(`/task/${id}`);
    },
};
    
