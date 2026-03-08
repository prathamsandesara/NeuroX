import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    withCredentials: true, // Important for cookies
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If unauthorized, maybe redirect to login or just reject
            // We can also clear local state if needed
            // window.location.href = '/login'; // invasive, let context handle it
        }
        return Promise.reject(error);
    }
);

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Check for bypass user in localStorage (if we stored it) or context
        // Since we can't access context here easily, we rely on the component usage or store 'bypass_role' in localStorage
        const bypassRole = localStorage.getItem('bypass_role');
        if (bypassRole) {
            config.headers['x-bypass-role'] = bypassRole;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
