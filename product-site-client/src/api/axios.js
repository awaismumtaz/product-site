import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:5001/api',
  withCredentials: true,        // send/receive cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
