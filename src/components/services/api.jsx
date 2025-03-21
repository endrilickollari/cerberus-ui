import axios from 'axios';

const API_BASE_URL = 'https://cerberus-api-0773eaec6d0f.herokuapp.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (err) => {
    return Promise.reject(err);
})

api.interceptors.response.use((response) => {
    return response;
}, (err) => {
    if (err.response) {
        const {status} = err.response;
        switch (status) {
            case 401:
                console.error('Authentication error:', err.response.data)
                break;
            case 403:
                console.error('Permission denied:', err.response.data)
                break;
            case 404:
                console.error('Resource not found:', err.response.data)
                break;
            case 500:
                console.error('Server error:', err.response.data)
                break;
            default:
                console.error('API error:', err.response.data);
        }
    } else if (err.request) {
        console.error('No response received:', err.request);
    } else {
        // Something happened in setting up the request
        console.error('Request error:', err.message);
    }
    return Promise.reject(err);
})

const endpoints = {
    login: (credentials) => api.post('/login', credentials),
    getServerDetails: () => api.get('/server-details'),
    getCpuInfo: () => api.get('/server-details/cpu-info'),
    getDiskUsage: () => api.get('/server-details/disk-usage'),
    getRunningProcesses: () => api.get('/server-details/running_processes'),
}

export default endpoints