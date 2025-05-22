import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5246/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle cookies
api.interceptors.request.use(
  config => {
    // Ensure credentials are included
    config.withCredentials = true;
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL
        }
      });

      if (error.response.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access');
      } else if (error.response.status === 405) {
        // Handle method not allowed
        console.error('Method not allowed. Please check the API endpoint and HTTP method.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', {
        request: error.request,
        config: {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL
        }
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
