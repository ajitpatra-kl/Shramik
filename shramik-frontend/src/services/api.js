import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token from localStorage into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shramik_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Capture authentication errors (401 / 403) to trigger logout triggers
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      logOutUser();
    }
    return Promise.reject(error);
  }
);

function logOutUser() {
  localStorage.removeItem('shramik_token');
  localStorage.removeItem('shramik_user_email');
  localStorage.removeItem('shramik_user_role');
  localStorage.removeItem('shramik_user_id');
  if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
    window.location.href = '/';
  }
}

export default api;
export { API_BASE_URL };
