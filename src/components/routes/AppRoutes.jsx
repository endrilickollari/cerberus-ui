// src/components/routes/AppRoutes.jsx
import React, {useContext, useEffect} from 'react';
import {Routes, Route, Navigate, useNavigate, useLocation} from 'react-router-dom';
import LoginForm from '../auth/LoginForm/LoginForm';
import Dashboard from '../dashboard/Dashboard';
import ApiDocs from '../ApiDocs/ApiDocs';
import {AuthContext} from '../context/AuthContext';
import AuthDebugger from '../auth/AuthDebugger';

// Protected route component that checks for authentication
const ProtectedRoute = ({children}) => {
    const {token} = useContext(AuthContext);
    const location = useLocation();

    console.log('ProtectedRoute check - token:', !!token);

    // If not authenticated, redirect to login with return path
    if (!token) {
        return <Navigate to="/" state={{from: location.pathname}} replace/>;
    }

    // If authenticated, render the protected content
    return children;
};

const AppRoutes = () => {
    const {token} = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Effect to redirect authenticated users to dashboard
    useEffect(() => {
        console.log('AppRoutes - checking auth state, token exists:', !!token);

        if (token && location.pathname === '/') {
            console.log('User is authenticated and at root path, redirecting to dashboard');
            // Redirect to the path saved in location state or default to dashboard
            const savedPath = location.state?.from || '/dashboard/server';
            navigate(savedPath, {replace: true});
        }
    }, [token, navigate, location]);

    return (
        <>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LoginForm/>}/>
                <Route path="/api-docs" element={<ApiDocs/>}/>

                {/* Protected dashboard routes */}
                <Route
                    path="/dashboard/*"
                    element={
                        <ProtectedRoute>
                            <Dashboard/>
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all route for handling invalid paths */}
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>

            {/* Debug component - only visible in development */}
            {/*<AuthDebugger/>*/}
        </>
    );
};

export default AppRoutes;