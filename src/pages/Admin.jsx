import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [file, setFile] = useState(null);
  const [urls, setUrls] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToChat = () => {
    navigate('/chatbot');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: 'Please select a PDF or TXT file' });
      setFile(null);
    }
  };

  const handleUrlChange = (e) => {
    setUrls(e.target.value);
    setMessage({ type: '', text: '' });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/ingest-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage({ type: 'success', text: response.data.message });
      setFile(null);
      e.target.reset();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Error uploading file' 
      });
    } finally {
      setFileLoading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urls.trim()) {
      setMessage({ type: 'error', text: 'Please enter at least one URL' });
      return;
    }

    setUrlLoading(true);
    // Split by newlines and filter out empty lines
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);

    // Validate URLs
    const invalidUrls = urlList.filter(url => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Invalid URLs found: ${invalidUrls.join(', ')}` 
      });
      setUrlLoading(false);
      return;
    }

    console.log('Sending URLs:', urlList); // Debug log

    try {
      const response = await axios.post(
        'http://localhost:8000/ingest-urls',
        urlList,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMessage({ type: 'success', text: response.data.message });
      setUrls('');
    } catch (error) {
      console.error('URL processing error:', {
        status: error.response?.status,
        data: error.response?.data,
        request: error.config?.data
      });
      
      let errorMessage = 'Error processing URLs';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoToChat}
                className="btn-primary"
              >
                Go to Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            {message.text && (
              <div className={`mb-4 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-8">
              {/* File Upload Section */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h2>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF or TXT files only</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {file && (
                    <p className="text-sm text-gray-600">Selected file: {file.name}</p>
                  )}
                  <button
                    type="submit"
                    disabled={fileLoading || !file}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      fileLoading || !file
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {fileLoading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </form>
              </div>

              {/* URL Input Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Process URLs</h2>
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="urls" className="block text-sm font-medium text-gray-700">
                      Enter URLs (one per line)
                    </label>
                    <textarea
                      id="urls"
                      rows="4"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://example.com/page1&#10;https://example.com/page2"
                      value={urls}
                      onChange={handleUrlChange}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={urlLoading || !urls.trim()}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      urlLoading || !urls.trim()
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {urlLoading ? 'Processing...' : 'Process URLs'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 