import { useState } from 'react';
import axios from 'axios';

const SessionList = ({ onSelectSession, currentSessionId, sessions, onSessionDeleted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, sessionId: null, sessionName: '' });

  const handleDeleteClick = (e, sessionId, sessionName) => {
    e.stopPropagation(); // Prevent triggering the session selection
    setConfirmDelete({ show: true, sessionId, sessionName });
  };

  const handleConfirmDelete = async () => {
    const { sessionId } = confirmDelete;
    setDeletingSessionId(sessionId);
    setConfirmDelete({ show: false, sessionId: null, sessionName: '' });
    
    try {
      await axios.delete(`http://localhost:8000/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (onSessionDeleted) {
        onSessionDeleted(sessionId);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError(error.response?.data?.detail || 'Error deleting session');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ show: false, sessionId: null, sessionName: '' });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat History</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No chat sessions yet</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              // Get the first user message as preview
              const firstUserMessage = session.messages.find(msg => msg.role === 'user')?.content || 'New Chat';
              // Format the date
              const date = new Date(session.created_at);
              const formattedDate = date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={session.session_id}
                  className={`relative group ${
                    session.session_id === currentSessionId
                      ? 'bg-primary-100'
                      : 'hover:bg-gray-100'
                  } rounded-lg transition-colors duration-200`}
                >
                  <button
                    onClick={() => onSelectSession(session)}
                    className="w-full text-left p-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium truncate">
                        {firstUserMessage.length > 50 
                          ? firstUserMessage.substring(0, 50) + '...' 
                          : firstUserMessage}
                      </span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {formattedDate}
                        </span>
                        <span className="text-xs text-gray-500">
                          {session.messages.length} messages
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, session.session_id, firstUserMessage)}
                    disabled={deletingSessionId === session.session_id}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {deletingSessionId === session.session_id ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Session</h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this session? This action cannot be undone.
              </p>
              {confirmDelete.sessionName && (
                <p className="text-sm font-medium text-gray-900 mt-2">
                  Session: "{confirmDelete.sessionName.length > 50 
                    ? confirmDelete.sessionName.substring(0, 50) + '...' 
                    : confirmDelete.sessionName}"
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList; 