import { useState, useCallback } from 'react';

/**
 * Custom hook for interacting with the LLM-powered chat assistant
 * @param {Object} options - Configuration options
 * @param {boolean} options.simulateLocally - Whether to simulate responses locally (for demo/testing)
 * @param {string} options.apiEndpoint - API endpoint for the LLM service
 * @returns {Object} Chat functionality and state
 */
export const useChatAssistant = (options = {}) => {
  const { 
    simulateLocally = true, 
    apiEndpoint = '/api/chat' 
  } = options;

  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generates a simulated AI response based on user query
   * @param {string} userMessage - The user's message
   * @returns {string} Simulated AI response
   */
  const generateSimulatedResponse = (userMessage) => {
    // Simple simulation logic for common OID-related queries
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('register') || lowerMessage.includes('new badge')) {
      return `To register a new badge, navigate to the "Register Badge" page from the sidebar or dashboard. You'll need to provide:

1. A badge name and description
2. The parent OID (usually 1.3.6.1.4.1 for enterprise)
3. A suffix that follows your organizational hierarchy
4. Owner information and expiry date if applicable

Would you like me to show you an example of a well-structured badge registration?`;
    } 
    
    if (lowerMessage.includes('structure') || lowerMessage.includes('oid')) {
      return `An OID (Object Identifier) follows a hierarchical structure represented by dot-separated numbers.

The BrainSAIT system uses a structure like:
1.3.6.1.4.1.XXXX.YY.ZZ

Where:
- 1.3.6.1.4.1 is the private enterprise prefix
- XXXX is the BrainSAIT enterprise number
- YY identifies the department/category
- ZZ identifies the specific badge or resource

You can visualize the full structure in the OID Tree page.`;
    }
    
    if (lowerMessage.includes('revoke') || lowerMessage.includes('delete')) {
      return `To revoke a badge:

1. Navigate to the badge's details page via the Dashboard or OID Tree
2. Click the "Edit Badge" button
3. At the bottom of the form, click "Revoke Badge"
4. Confirm the action when prompted

Revoked badges aren't deleted, but marked as invalid. This maintains the OID hierarchy while preventing future use.`;
    }
    
    if (lowerMessage.includes('generate') || lowerMessage.includes('secure')) {
      return `Based on your request, I recommend the following secure OID structure for your new project:

1.3.6.1.5.9999.200.1

This is structured as:
- 1.3.6.1.5: Security branch (more secure than the enterprise branch)
- 9999: Your organization identifier
- 200: New project identifier (reserved range for secured projects)
- 1: First badge in the project series

Would you like to register this OID now?`;
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm your BrainSAIT OID System Assistant. I can help you with:

- Badge registration and management
- OID structure and best practices
- System navigation and troubleshooting
- Security recommendations

What would you like help with today?`;
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! If you have any other questions about the OID badge system, feel free to ask anytime.";
    }
    
    // Generic response for other queries
    return `I understand you're asking about "${userMessage}". 

The BrainSAIT OID system follows RFC 2578 guidelines for OID structure and management. Each badge has a unique identifier and can be configured with different access levels, expiry dates, and ownership information.

To learn more about a specific aspect of the system, could you provide more details about what you're looking for?`;
  };

  /**
   * Send a message to the chat assistant and get a response
   * @param {string} message - User message to send
   * @returns {Promise<Object>} The assistant's response
   */
  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      let response;

      if (simulateLocally) {
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = generateSimulatedResponse(message);
      } else {
        // Actually call the LLM API
        const apiResponse = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (!apiResponse.ok) {
          throw new Error(`API returned ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        response = data.response;
      }

      // Add assistant response to chat
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [simulateLocally, apiEndpoint]);

  /**
   * Clear all messages from the chat
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isProcessing,
    error,
    sendMessage,
    clearMessages
  };
};

export default useChatAssistant;
