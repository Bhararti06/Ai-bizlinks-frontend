import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const activeRole = localStorage.getItem('activeRole');
        if (activeRole) {
            config.headers['X-Active-Role'] = activeRole;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Auto logout if 401 response returned from api
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; // Optional: redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
