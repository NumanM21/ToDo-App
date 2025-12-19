// Main component - Our UI Code
import {Navigate, Route, Routes} from "react-router-dom";
import LoginPage from "../pages/LoginPage.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";

function App() {  // similar to  // useState - React hook  (function) - returns curr val and function to update it -- state change -> component re-renders (UI)

  // Looks like HTML, but is JSX (React JS)
    return (
        <Routes>
            <Route path = "/" element = {<Navigate to="/login" replace />} />   {/* '/' will redirect to our /login page */}
            <Route path = "/login" element={<LoginPage/>} />  {/* Shows login page */}
            <Route path = "/register" element={<RegisterPage/>}  />
            <Route path = "/dashboard" element={<DashboardPage/>} />
        </Routes>
    );
}

export default App
