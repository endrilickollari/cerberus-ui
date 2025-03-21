import {useState, useCallback, useContext, useEffect} from 'react';
import {AuthContext} from '../context/AuthContext';

/**
 * Custom hook for making API requests with built-in state management
 * @param {Function} apiFn - The API function to call
 * @param {boolean} autoFetch - Whether to fetch data automatically on mount
 * @param {any[]} dependencies - Dependencies for auto-fetch useEffect
 * @returns {Object} API state and control functions
 */
const useApi = (apiFn, autoFetch = false, dependencies = []) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const {logout} = useContext(AuthContext);

    // Function to execute the API call
    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFn(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err);

            // Handle unauthorized errors
            if (err.response?.status === 401) {
                logout();
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFn, logout]);

    // Reset state
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch && apiFn) {
            execute().then(r => console.log(r));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, apiFn, ...dependencies]);

    return {
        data,
        error,
        loading,
        execute,
        reset
    };
};

export default useApi;

