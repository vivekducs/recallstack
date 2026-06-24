import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Configure global defaults on the default axios instance for direct imports across the app
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

const injectAuthHeader = (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

// Add interceptor to the global axios instance
axios.interceptors.request.use(injectAuthHeader, (error) => Promise.reject(error));

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to the custom apiClient instance
apiClient.interceptors.request.use(injectAuthHeader, (error) => Promise.reject(error));

export default apiClient;
