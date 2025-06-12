const ChatMessage = ({ message, isUser }) => {
  // Split the message by newlines and map each line to a paragraph
  const formattedMessage = message.split('\n').map((line, index) => {
    // If the line is empty, add a line break
    if (line.trim() === '') {
      return <br key={index} />;
    }
    // If the line starts with a number and a dot (like "1.", "2.", etc.), add proper spacing
    if (/^\d+\./.test(line)) {
      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      );
    }
    // For regular lines
    return <p key={index}>{line}</p>;
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">
          {formattedMessage}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 