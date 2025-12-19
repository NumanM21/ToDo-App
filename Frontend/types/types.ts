//  user from login/register response
export interface User {
    userId: number;
    email: string;
    firstName: string;
}

// Auth response from backend
export interface AuthResponse {
    token: string;
    userId: number;
    email: string;
    firstName: string;
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
    location?:string;
    
    
    
}
