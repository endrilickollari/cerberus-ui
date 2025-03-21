import React, {createContext, useState, useEffect, useCallback} from "react";
import apiEndpoints from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [token]);

    // Login function
    const login = useCallback(async (credentials) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiEndpoints.login(credentials);
            const {token: authToken, user: userData} = response.data;

            setToken(authToken);
            setUser(userData);
            return {success: true};
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            return {success: false, error: errorMessage};
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        setLoading(true);

        try {
            // Call logout endpoint if user is authenticated
            if (isAuthenticated) {
                await apiEndpoints.logout();
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear local state regardless of API response
            setToken(null);
            setUser(null);
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Auth context value
    const contextValue = {
        token,
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
