import { useState, useRef, useEffect } from 'react';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your BrainSAIT OID System Assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const suggestions = [
    "How do I register a new badge?",
    "What's the structure of an OID?",
    "How do I revoke a badge?",
    "Show me the latest system changes",
    "Generate a secure OID for my new project"
  ];
  
  // Check if on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);
    
    // Simulate AI response with a slight delay for realism
    setTimeout(() => {
      generateResponse(userMessage.content);
    }, 1000);
  };
  
  const generateResponse = (userMessage) => {
    // Simulate LLM response based on user input
    let aiResponse = '';
    
    if (userMessage.toLowerCase().includes('register') || userMessage.toLowerCase().includes('new badge')) {
      aiResponse = `To register a new badge, navigate to the "Register Badge" page from the sidebar or dashboard. You'll need to provide:

1. A badge name and description
2. The parent OID (usually 1.3.6.1.4.1 for enterprise)
3. A suffix that follows your organizational hierarchy
4. Owner information and expiry date if applicable

Would you like me to show you an example of a well-structured badge registration?`;
    } 
    else if (userMessage.toLowerCase().includes('structure') || userMessage.toLowerCase().includes('oid')) {
      aiResponse = `An OID (Object Identifier) follows a hierarchical structure represented by dot-separated numbers.

The BrainSAIT system uses a structure like:
1.3.6.1.4.1.XXXX.YY.ZZ

Where:
- 1.3.6.1.4.1 is the private enterprise prefix
- XXXX is the BrainSAIT enterprise number
- YY identifies the department/category
- ZZ identifies the specific badge or resource

You can visualize the full structure in the OID Tree page.`;
    }
    else if (userMessage.toLowerCase().includes('revoke') || userMessage.toLowerCase().includes('delete')) {
      aiResponse = `To revoke a badge:

1. Navigate to the badge's details page via the Dashboard or OID Tree
2. Click the "Edit Badge" button
3. At the bottom of the form, click "Revoke Badge"
4. Confirm the action when prompted

Revoked badges aren't deleted, but marked as invalid. This maintains the OID hierarchy while preventing future use.`;
    }
    else if (userMessage.toLowerCase().includes('generate') || userMessage.toLowerCase().includes('secure')) {
      aiResponse = `Based on your request, I recommend the following secure OID structure for your new project:

1.3.6.1.5.9999.200.1

This is structured as:
- 1.3.6.1.5: Security branch (more secure than the enterprise branch)
- 9999: Your organization identifier
- 200: New project identifier (reserved range for secured projects)
- 1: First badge in the project series

Would you like to register this OID now?`;
    }
    else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      aiResponse = `Hello! I'm your BrainSAIT OID System Assistant. I can help you with:

- Badge registration and management
- OID structure and best practices
- System navigation and troubleshooting
- Security recommendations

What would you like help with today?`;
    }
    else if (userMessage.toLowerCase().includes('thank')) {
      aiResponse = "You're welcome! If you have any other questions about the OID badge system, feel free to ask anytime.";
    }
    else {
      aiResponse = `I understand you're asking about "${userMessage}". 

The BrainSAIT OID system follows RFC 2578 guidelines for OID structure and management. Each badge has a unique identifier and can be configured with different access levels, expiry dates, and ownership information.

To learn more about a specific aspect of the system, could you provide more details about what you're looking for?`;
    }
    
    const botMessage = {
      id: Date.now(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleAttachFile = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a message indicating file upload
    const fileMessage = {
      id: Date.now(),
      role: 'user',
      content: `I've uploaded a file: ${file.name}`,
      attachment: {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      },
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, fileMessage]);
    
    // Simulate AI response to file upload
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I've received your file "${file.name}". Is there something specific you'd like me to help you with regarding this file?`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
    
    // Reset file input
    e.target.value = null;
  };
  
  // Helper function for attachment display
  const renderAttachment = (attachment) => {
    const isImage = attachment.type.startsWith('image/');
    
    return (
      <div className="mt-2 p-2 bg-darker-bg rounded-md flex items-center">
        <div className="p-2 rounded-md bg-content-bg mr-2">
          {isImage ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor" loading="lazy">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor" loading="lazy">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{attachment.name}</p>
          <p className="text-xs text-text-secondary">{attachment.size}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-primary">Chat Assistant</h1>
        <p className="text-sm text-text-secondary mt-1">Get help and guidance from our AI assistant</p>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Main Chat Area */}
        <div className="flex-1 card flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-border-color">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-primary" viewBox="0 0 20 20" fill="currentColor" loading="lazy">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-primary">BrainSAIT Assistant</p>
                <p className="text-xs text-text-secondary">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-success mr-1"></span>
                    Online
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {message.attachment && renderAttachment(message.attachment)}
                  
                  <div className="mt-1 text-right">
                    <span className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="chat-message-ai py-2 px-4">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-border-color p-4">
            <div className="relative">
              <textarea
                className="input min-h-[60px] pl-4 pr-12 py-3 resize-none"
                placeholder="Type your message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                rows={2}
              ></textarea>
              
              <div className="absolute right-2 bottom-2 flex">
                <button
                  onClick={handleAttachFile}
                  className="p-2 rounded-full text-text-secondary hover:text-primary focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" loading="lazy">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button
                  onClick={handleSendMessage}
                  className="p-2 rounded-full text-primary hover:text-primary-light focus:outline-none"
                  disabled={!inputValue.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" loading="lazy">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11h2a1 1 0 00.9-.553l4-8a1 1 0 00-.9-1.447h-7.118l2.112-2.224a1 1 0 00-.12-1.493L4.654 2.749a1 1 0 00-1.253.18L.01 7.061a1 1 0 00.098 1.266l2.4 2.4A1 1 0 003.5 10H8v5.571l-6.5 1.857a1 1 0 00-.59 1.545l3.71 3.71a1 1 0 001.415-1.42l-2.299-2.3 6.5-1.857a1 1 0 00.713-.954V10h6.182a1 1 0 00.894-.553l3-6A1 1 0 0017 2h-6.106z" />
                  </svg>
                </button>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs py-1.5 px-3 bg-darker-bg rounded-full text-text-secondary hover:bg-primary hover:text-text-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Side Panel - only shown on desktop */}
        {!isMobile && (
          <div className="w-80 card">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-lg font-semibold text-text-primary">Assistant Info</h2>
            </div>
            <div className="p-4">
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-primary" viewBox="0 0 20 20" fill="currentColor" loading="lazy">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-medium text-text-primary">BrainSAIT Assistant</h3>
                <p className="text-sm text-text-secondary">AI-powered OID management helper</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-2">Capabilities</h3>
                <ul className="text-xs text-text-secondary space-y-2">
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>OID structure guidance and best practices</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Badge registration and management assistance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Security recommendations for OID configuration</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Troubleshooting and explaining system messages</span>
                  </li>
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-2">Example Questions</h3>
                <ul className="text-xs text-text-secondary space-y-2">
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>"What's the difference between private and security OIDs?"</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>"How do I create badges for a new department?"</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>"What are best practices for OID suffix naming?"</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">Model Information</h3>
                <p className="text-xs text-text-secondary">
                  BrainSAIT Assistant is powered by a large language model trained on OID management best practices, RFC standards, and security protocols.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAssistant;
