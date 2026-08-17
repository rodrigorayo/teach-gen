import axios from 'axios';
import { mockApi } from './mockApi';

// Default to Real API Mode unless 'use_mock' is explicitly set to 'true' in localStorage
const useMock = localStorage.getItem('use_mock') === 'true';

if (useMock && !localStorage.getItem('token')) {
  // Inject mock token to bypass login check when in Mock Mode
  localStorage.setItem('token', 'mock-jwt-token-xyz');
}

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Interceptor to inject token
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = useMock ? (mockApi as any) : apiInstance;

export default api;
