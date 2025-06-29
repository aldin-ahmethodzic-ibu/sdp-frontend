const ChatMessage = ({ message, isUser }) => {
  // Function to parse markdown and convert to JSX
  const parseMarkdown = (text) => {
    // Split by lines to handle different block types
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Empty line
      if (trimmedLine === '') {
        return <br key={lineIndex} />;
      }
      
      // Bullet points
      if (trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2);
        return (
          <div key={lineIndex} className="flex items-start mb-1">
            <span className="mr-2 text-gray-600">•</span>
            <span>{parseInlineMarkdown(content)}</span>
          </div>
        );
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)\.\s(.+)/);
        if (match) {
          const number = match[1];
          const content = match[2];
          return (
            <div key={lineIndex} className="flex items-start mb-1">
              <span className="mr-2 text-gray-600 font-medium">{number}.</span>
              <span>{parseInlineMarkdown(content)}</span>
            </div>
          );
        }
      }
      
      // Regular paragraph
      return (
        <p key={lineIndex} className="mb-2">
          {parseInlineMarkdown(trimmedLine)}
        </p>
      );
    });
  };
  
  // Function to parse inline markdown (bold, italic, etc.)
  const parseInlineMarkdown = (text) => {
    // Handle bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let result = text;
    let elements = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }
      
      // Add the bold text
      elements.push(
        <strong key={`bold-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    
    // If no bold text found, return original text
    if (elements.length === 0) {
      return text;
    }
    
    return elements;
  };

  const formattedMessage = parseMarkdown(message);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="text-sm">
          {formattedMessage}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 