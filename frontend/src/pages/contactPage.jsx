import React, { useState, useEffect, useRef } from 'react';
import '../styles/contactPage.css';
import io from 'socket.io-client';

const ContactPage = () => {
  // Get user data from localStorage
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('questions'); // 'questions' or 'chat'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const initialMessageAdded = useRef(false);
  const chatMessagesRef = useRef(null);

  // Load user data on component mount
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Single card with 3 main questions + live chat option
  const mainQuestion = {
    question: "How can I book a Bondy service?",
    options: [
      "I need help with booking process",
      "I want to know about available services", 
      "I have payment issues",
      "Chat with Customer Executive"
    ]
  };

  // Initialize socket connection
  useEffect(() => {
    if (currentStep === 'chat') {
      const newSocket = io('http://localhost:3005');
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        addMessage('Customer Support', 'Hello! How can I help you today?', 'received');
      });
      
      newSocket.on('disconnect', () => {
        setIsConnected(false);
        // Clear messages when disconnected
        setMessages([]);
      });

      newSocket.on('message', (data) => {
        addMessage('Customer Support', data.message, 'received');
        
        // Aggressive scroll when admin message is received
        setTimeout(() => {
          scrollToBottom();
        }, 10);
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        setTimeout(() => {
          scrollToBottom();
        }, 300);
        setTimeout(() => {
          scrollToBottom();
        }, 600);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        // Clear messages when component unmounts
        setMessages([]);
      };
    }
  }, [currentStep]);

  // Add initial bot message only once when component mounts
  useEffect(() => {
    if (!initialMessageAdded.current) {
      addMessage('Bondy Support', 'How can I help you today?', 'received');
      initialMessageAdded.current = true;
    }
  }, []);

  const addMessage = (sender, text, type) => {
    const now = new Date();
    const message = {
      id: Date.now(),
      sender,
      text,
      type,
      timestamp: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
    setMessages(prev => [...prev, message]);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Multiple attempts with different delays to ensure it works
    setTimeout(() => {
      scrollToBottom();
    }, 10);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    setTimeout(() => {
      scrollToBottom();
    }, 300);
    setTimeout(() => {
      scrollToBottom();
    }, 600);
  }, [messages]);

  // Check if user is at bottom of chat
  const checkIfAtBottom = () => {
    const chatMessages = chatMessagesRef.current || 
                        document.querySelector('.chat-messages') ||
                        document.querySelector('.bot-chat-section .chat-messages');
    
    if (chatMessages) {
      const threshold = 100; // pixels from bottom
      const isAtBottom = chatMessages.scrollTop + chatMessages.clientHeight >= 
                       chatMessages.scrollHeight - threshold;
      setIsAtBottom(isAtBottom);
    }
  };

  // Enhanced scroll to bottom function
  const scrollToBottom = () => {
    // Try multiple selectors to find the chat container
    const chatMessages = chatMessagesRef.current || 
                        document.querySelector('.chat-messages') ||
                        document.querySelector('.bot-chat-section .chat-messages');
    
    if (chatMessages) {
      // Calculate the exact scroll position needed
      const scrollHeight = chatMessages.scrollHeight;
      const clientHeight = chatMessages.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      // Method 1: Scroll to absolute maximum with extra buffer
      chatMessages.scrollTop = maxScroll + 100; // Extra 100px buffer
      
      // Method 2: Smooth scroll to maximum
      chatMessages.scrollTo({
        top: maxScroll + 100,
        behavior: 'smooth'
      });
      
      // Method 3: Scroll last message into view with extra margin
      const lastMessage = chatMessages.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',
          inline: 'nearest'
        });
        
        // Additional scroll after scrollIntoView
        setTimeout(() => {
          chatMessages.scrollTop = chatMessages.scrollHeight + 100;
        }, 300);
      }
      
      // Method 4: Force multiple updates with increasing offsets
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight + 50;
      }, 50);
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight + 100;
      }, 150);
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight + 150;
      }, 300);
    }
  };

  const handleQuestionSelect = (option) => {
    // Add user's selection to chat
    addMessage('You', option, 'sent');
    
    if (option === "Chat with Customer Executive") {
      // Show bot response first, then transition to live chat
      addMessage('Bondy Bot', 'I understand you need to speak with our customer executive. Let me connect you with our support team.', 'received');
      
      // Small delay to make it feel more natural
      setTimeout(() => {
        setCurrentStep('chat');
        // Scroll to bottom after transitioning to chat
        setTimeout(() => {
          scrollToBottom();
        }, 200);
      }, 1500);
    } else {
      // Instant bot responses with typing effect
      const responses = {
        "I need help with booking process": "To book a Bondy service:\n\n1. Go to 'Book Bondy' page\n2. Select your service type\n3. Choose date & time\n4. Fill in your details\n\nIt's that simple! Takes just 2-3 minutes. 😊",
        "I want to know about available services": "🎯 We offer 3 main services:\n\n• Technology Help - Phone/computer assistance\n• Social Outings - Companionship for activities\n• Administrative Tasks - Paperwork & errands\n\nEach service is designed for elderly users' daily needs!",
        "I have payment issues": "💳 We accept multiple payment methods:\n\n• Credit/Debit cards\n• UPI payments\n• Net banking\n\nIf you're having issues, please check your payment method or contact our support team for immediate assistance."
      };

      const response = responses[option];
      if (response) {
        // Add typing indicator effect
        addMessage('Bondy Bot', 'Typing...', 'received');
        
        setTimeout(() => {
          // Remove typing indicator and add actual response
          setMessages(prev => prev.slice(0, -1));
          addMessage('Bondy Bot', response, 'received');
          // Scroll to bottom after bot response
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }, 1000);
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      addMessage('You', newMessage, 'sent');
      socket.emit('message', {
        message: newMessage,
        userId: user?._id,
        username: user?.username || 'Guest'
      });
      setNewMessage('');
      
      // Multiple aggressive attempts to scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 10);
      setTimeout(() => {
        scrollToBottom();
      }, 50);
      setTimeout(() => {
        scrollToBottom();
      }, 150);
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const ScrollToBottomButton = () => (
    !isAtBottom && (
      <button 
        className="scroll-to-bottom-btn"
        onClick={scrollToBottom}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: '#4e6ef2',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 10
        }}
      >
        ↓
      </button>
    )
  );


  return (
    <div className="contact-page">
      <div className="contact-container">
        {currentStep === 'questions' ? (
          <div className="questions-section">
            {/* Show chat interface with bot messages */}
            <div className="bot-chat-section">
              <div className="chat-messages" ref={chatMessagesRef} onScroll={checkIfAtBottom}>
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="message-content">
                      <div className="message-sender">{message.sender}</div>
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">{message.timestamp}</div>
                    </div>
                  </div>
                ))}
                
                {/* Show question card as bot message */}
                {messages.length > 0 && (
                  <div className="message received">
                    <div className="message-content">
                      <div className="message-sender">Bondy Support</div>
                      <div className="question-card-message">
                        <h4>{mainQuestion.question}</h4>
                        <div className="options-list">
                          {mainQuestion.options.map((option, index) => (
                            <button
                              key={index}
                              className={`option-btn ${option === "Chat with Customer Executive" ? 'chat-option' : ''}`}
                              onClick={() => handleQuestionSelect(option)}
                            >
                              {option}
                              <span className="arrow">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="message-time">{new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</div>
                    </div>
                  </div>
                )}
                
                <ScrollToBottomButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-section">
            <div className="chat-header">
              <div className="chat-info">
                <h3>Bondy Chat Support</h3>
                <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                  {isConnected ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            <div className="chat-messages" ref={chatMessagesRef} onScroll={checkIfAtBottom}>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <div className="message-sender">{message.sender}</div>
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                </div>
              ))}
              
              <ScrollToBottomButton />
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
              />
              <button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
