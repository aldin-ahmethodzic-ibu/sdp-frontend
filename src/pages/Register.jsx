import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'student' // Default value
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Sending registration request:', formData);
      const response = await axios.post('http://localhost:8000/register', formData);
      console.log('Registration response:', response.data);
      
      // Store the token if it's in the response
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="form-container">
        <h2 className="form-title">
          Create your account
        </h2>
        <form className="form-group" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="user_type" className="sr-only">User Type</label>
              <select
                id="user_type"
                name="user_type"
                required
                className="input-field"
                value={formData.user_type}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </div>

          <div className="pt-4">
            <Link to="/login" className="form-link block">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 