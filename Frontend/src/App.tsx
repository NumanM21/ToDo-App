// Main component - Our UI Code
import {Navigate, Route, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {  // similar to  // useState - React hook  (function) - returns curr val and function to update it -- state change -> component re-renders (UI)

    // Looks like HTML, but is JSX (React JS)
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/> {/* '/' will redirect to our /login page */}
            <Route path="/login" element={<LoginPage/>}/> {/* Shows login page */}
            <Route path="/register" element={<RegisterPage/>}/>

            {/* WRAP our dashboard (and any other protected pages in ProtectedRoute class)*/}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage/>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App
