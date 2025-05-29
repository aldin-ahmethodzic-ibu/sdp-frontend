import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatMessage from '../components/ChatMessage';
import SessionList from '../components/SessionList';
import axios from 'axios';

const Chatbot = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
  };

  const handleSelectSession = (session) => {
    console.log('Selected session:', session);
    setCurrentSessionId(session.session_id);
    setMessages(session.messages.map(msg => ({
      content: msg.content,
      isUser: msg.role === 'user'
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message immediately
    const newUserMessage = { content: userMessage, isUser: true };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message with session_id:', currentSessionId);
      const response = await axios.post(
        'http://localhost:8000/chat',
        { 
          question: userMessage,
          session_id: currentSessionId // This will be null for new conversations
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Received response:', response.data);
      
      // Add assistant's response
      const assistantMessage = { content: response.data.answer, isUser: false };
      setMessages(prev => [...prev, assistantMessage]);

      // Always update session ID from response
      // For new conversations, this will be a new UUID
      // For existing conversations, this will be the same session_id
      setCurrentSessionId(response.data.session_id);

      // Refresh sessions list after each message
      await fetchSessions();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        content: 'Sorry, I encountered an error. Please try again.', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">SDP Chatbot</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="btn-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Session List Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-md flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={handleNewChat}
                className="w-full btn-primary"
              >
                New Chat
              </button>
            </div>
            <SessionList
              onSelectSession={handleSelectSession}
              currentSessionId={currentSessionId}
              sessions={sessions}
            />
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Start a conversation with the chatbot
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.content}
                    isUser={message.isUser}
                  />
                ))
              )}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="input-field flex-1"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading || !input.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot; 