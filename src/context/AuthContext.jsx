import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (username, password) => {
    try {
      // Step 1: Get the token
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const tokenResponse = await api.post('/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { access_token } = tokenResponse.data;
      
      // Step 2: Get user data with the token
      const userResponse = await api.get('/users/me', {
        headers: { 
          'Authorization': `Bearer ${access_token}`,
        }
      });
      
      // Only set token and user if both requests succeed
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userResponse.data);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error:', error.response.data);
        throw new Error(error.response.data.detail || 'Login failed');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
        throw new Error('Error setting up the request');
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
        throw new Error(error.response.data.detail || 'Registration failed');
      } else if (error.request) {
        console.error('Request error:', error.request);
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        console.error('Error:', error.message);
        throw new Error('Error setting up the request');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 