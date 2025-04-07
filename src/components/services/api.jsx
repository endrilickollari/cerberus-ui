import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cerberus-api-0773eaec6d0f.herokuapp.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Request interceptor to add authorization token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle specific error codes
        if (error.response) {
            // The request was made and the server responded with a status code
            // outside of the 2xx range
            const {status} = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - Token expired or invalid
                    console.error('Authentication error:', error.response.data);
                    break;
                case 403:
                    // Forbidden - Not enough permissions
                    console.error('Permission denied:', error.response.data);
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found:', error.response.data);
                    break;
                case 500:
                    // Server error
                    console.error('Server error:', error.response.data);
                    break;
                default:
                    console.error('API error:', error.response.data);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Request error:', error.message);
        }

        return Promise.reject(error);
    }
);

const endpoints = {
    login: (credentials) => api.post('/login', credentials),
    logout: () => {
    },
    getServerDetails: () => api.get('/server-details'),
    getCpuInfo: () => api.get('/server-details/cpu-info'),
    getDiskUsage: () => api.get('/server-details/disk-usage'),
    getRunningProcesses: () => api.get('/server-details/running_processes'),
    listFileSystem: () => api.get('filesystem/list'),
    listFileSystemDetails: () => api.get('filesystem/details'),
    searchFileSystem: () => api.get('filesystem/search'),
    getDockerImages: () => api.get('docker/images'),
}

export default endpoints