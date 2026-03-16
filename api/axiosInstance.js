import axios from 'axios';
import { Alert } from 'react-native';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

const axiosInstance = axios.create({
  baseURL: 'https://vfp.mobizo.in/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error codes
      if (error.response.status === 401) {
        // Token expired or invalid
        console.log('Unauthorized - token may be expired');
        
        // Show alert with logout option
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again to continue.',
          [
            {
              text: 'Logout',
              onPress: () => {
                // Dispatch logout action to clear token and navigate to login
                store.dispatch(logout());
              },
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
