import { useState } from 'react';

const SessionList = ({ onSelectSession, currentSessionId, sessions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
                <button
                  key={session.session_id}
                  onClick={() => onSelectSession(session)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    session.session_id === currentSessionId
                      ? 'bg-primary-100 text-primary-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionList; 