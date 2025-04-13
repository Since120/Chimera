import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Create a base API instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token';
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      // Clear token and redirect to login
      const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token';
      localStorage.removeItem(tokenKey);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
