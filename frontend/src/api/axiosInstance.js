import axios from 'axios';

const getBaseURL = () => {
    // If explicitly provided via .env (e.g. for Production), use that
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes('localhost') && import.meta.env.PROD) {
        return envUrl;
    }
    // Otherwise, dynamically infer the backend host based on how you accessed the frontend in the browser
    return `${window.location.protocol}//${window.location.hostname}:4000`;
};

const api = axios.create({
    baseURL: getBaseURL(),
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
