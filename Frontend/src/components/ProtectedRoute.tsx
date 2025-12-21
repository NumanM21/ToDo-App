// Route protection to ONLY allow authenticated users 
import {Navigate} from "react-router-dom";
import * as React from "react";

///// We can WRAP our protected pages (dashboard - User Profile ) - If token we let them see these pages, otherwise they are redirected to login to get a Token

// Checks if user is logged in - yes - show dashboard (children of login) - No - redirect to login
function ProtectedRoute({children} : {children: React.ReactNode}) {
    // Check if Token in localStorage
    const token = localStorage.getItem('token');
    
    // if null (no token) -> Go to login page
    if (!token) 
        return <Navigate to="/login " replace/> 
    
    // Token  exists -> show protected content
    return <>{children}</>;
}

export default ProtectedRoute;
