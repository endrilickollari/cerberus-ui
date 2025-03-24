import React, {createContext, useState, useEffect, useCallback} from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    // Initialize token from localStorage, handle if it's a stringified object
    const storedToken = localStorage.getItem('token');
    let initialToken = null;

    // Try to parse the token if it looks like JSON
    if (storedToken && (storedToken.startsWith('{') || storedToken === '[object Object]')) {
        try {
            initialToken = JSON.parse(storedToken);
        } catch (e) {
            // If parsing fails, use the token as is
            initialToken = storedToken;
        }
    } else {
        initialToken = storedToken;
    }

    const [token, setToken] = useState(initialToken);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken);

    // Persist token to localStorage whenever it changes
    useEffect(() => {
        if (token) {
            // Always store token as a simple string
            // If it's already a string containing the JWT, just store it directly
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
            // Use axios directly
            const baseURL = import.meta.env.VITE_API_BASE_URL;
            console.log('Making login request with credentials:', {
                ...credentials,
                password: credentials.password ? '********' : ''
            });

            // Make the request
            const response = await axios.post(`${baseURL}/login`, credentials, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            // Check and log the response structure for debugging
            console.log('Login API response:', response);

            // Extract token from the response
            let authToken = null;

            if (response && response.data) {
                if (response.data.data && response.data.data.token) {
                    // Structure: { success: true, data: { token: "xyz" } }
                    authToken = response.data.data.token;
                } else if (response.data.token) {
                    // Structure: { token: "xyz" }
                    authToken = response.data.token;
                } else if (typeof response.data === 'string') {
                    // Structure: "token-string"
                    authToken = response.data;
                }

                console.log('Extracted token:', authToken);
            }

            if (!authToken) {
                console.error('No token found in response');
                throw new Error('No token received from server');
            }

            // Set token state - using just the token string, not the full object
            setToken(authToken);

            // Set user info if available, otherwise set a basic user object
            setUser({username: credentials.username});

            return {success: true};
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
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
            // Clear state regardless of API response
            setToken(null);
            setUser(null);
            console.log('User logged out, token cleared');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

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