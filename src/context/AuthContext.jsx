import { createContext, useContext, useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found, fetching user data...');
      fetchUserData(token);
    } else {
      console.log('No token found');
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      console.log('Fetching user data...');
      const response = await api.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('User data received:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Attempting login...');
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true
      });

      console.log('Login successful, token received');
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      // Set the default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await fetchUserData(access_token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          return { success: false, error: 'Invalid username or password' };
        }
        return { success: false, error: error.response.data.detail || 'Login failed' };
      } else if (error.request) {
        if (error.message.includes('CORS')) {
          return { success: false, error: 'CORS error: Unable to connect to the server. Please check if the server is running and CORS is properly configured.' };
        }
        return { success: false, error: 'Network error: Unable to connect to the server' };
      } else {
        return { success: false, error: 'An unexpected error occurred' };
      }
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/users/', userData);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.detail) {
        return { success: false, error: error.response.data.detail };
      }
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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