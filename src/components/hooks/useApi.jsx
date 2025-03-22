// src/components/hooks/useApi.jsx
import { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for making API requests with built-in state management
 */
const useApi = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { logout } = useContext(AuthContext);

    // Function to execute the API call using axios directly
    const request = useCallback(async (config) => {
        setLoading(true);
        setError(null);

        try {
            // Use axios directly instead of api.request
            const baseURL = 'http://localhost:8080';
            const token = localStorage.getItem('token');

            // Set up request headers
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            if (token) {
                // Extract token if it's stored as JSON
                let authToken = token;
                if (token.startsWith('{') || token.startsWith('[')) {
                    try {
                        const parsedObj = JSON.parse(token);
                        if (parsedObj.data && parsedObj.data.token) {
                            authToken = parsedObj.data.token;
                        } else if (parsedObj.token) {
                            authToken = parsedObj.token;
                        }
                    } catch (e) {
                        console.error('Error parsing token:', e);
                    }
                }

                headers.Authorization = `Bearer ${authToken}`;
            }

            // Build full URL
            const url = `${baseURL}${config.url}`;

            console.log(`Making ${config.method || 'GET'} request to: ${url}`);

            // Make the request using axios directly
            console.log(`Making ${config.method || 'GET'} request to: ${url}`);

            const response = await axios({
                ...config,
                url,
                headers,
                method: config.method || 'GET'
            });

            console.log(`Received response from ${url}:`, response.status);

            // Handle different response structures
            if (response.data) {
                if (response.data.data) {
                    // Some APIs return { success: true, data: [...] }
                    setData(response.data.data);
                    return response.data.data;
                } else {
                    // Direct data array or object
                    setData(response.data);
                    return response.data;
                }
            } else {
                console.warn(`No data in response from ${url}`);
                setData(null);
                return null;
            }
        } catch (err) {
            console.error('API request error:', err);
            setError(err);

            // Handle unauthorized errors
            if (err.response && err.response.status === 401) {
                console.log('401 Unauthorized response, logging out');
                logout();
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, [logout]);

    return {
        data,
        error,
        loading,
        request
    };
};

export default useApi;