import React, { useState, useEffect, useRef } from 'react';
import '../styles/contactPage.css';
import io from 'socket.io-client';

const ContactPage = () => {
  // Get user data from localStorage (simple approach)
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  const [currentStep, setCurrentStep] = useState('questions'); // 'questions' or 'chat'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const initialMessageAdded = useRef(false);

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

  // Additional questions for bot responses
  const additionalQuestions = {
    "I need help with booking process": {
      question: "Booking Process Help",
      options: [
        "Step-by-step booking guide",
        "Troubleshooting booking issues",
        "Account setup help",
        "Chat with Customer Executive"
      ]
    },
    "I want to know about available services": {
      question: "Available Services",
      options: [
        "Technology Help details",
        "Social Outings information", 
        "Administrative Tasks info",
        "Chat with Customer Executive"
      ]
    },
    "I have payment issues": {
      question: "Payment Support",
      options: [
        "Payment method problems",
        "Billing questions",
        "Refund requests",
        "Chat with Customer Executive"
      ]
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (currentStep === 'chat') {
      const newSocket = io('http://localhost:3005');
      
      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        addMessage('Customer Support', 'Hello! How can I help you today?', 'received');
      });
      
      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
        // Clear messages when disconnected
        setMessages([]);
      });

      newSocket.on('message', (data) => {
        addMessage('Customer Support', data.message, 'received');
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

  const handleQuestionSelect = (option) => {
    setSelectedQuestion({ option });
    
    // Add user's selection to chat
    addMessage('You', option, 'sent');
    
    if (option === "Chat with Customer Executive") {
      // Show bot response first, then transition to live chat
      addMessage('Bondy Bot', 'I understand you need to speak with our customer executive. Let me connect you with our support team.', 'received');
      
      // Small delay to make it feel more natural
      setTimeout(() => {
        setCurrentStep('chat');
      }, 1500);
    } else {
      // Instant bot responses with typing effect
      const responses = {
        "I need help with booking process": "📱 To book a Bondy service:\n\n1. Go to 'Book Bondy' page\n2. Select your service type\n3. Choose date & time\n4. Fill in your details\n\nIt's that simple! Takes just 2-3 minutes. 😊",
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className="contact-page">
      <div className="contact-container">
        {currentStep === 'questions' ? (
          <div className="questions-section">
            <div className="contact-header">
              <h1>Bondy Support</h1>
              <p>How can we help you today?</p>
            </div>

            {/* Show chat interface with bot messages */}
            <div className="bot-chat-section">
              <div className="chat-messages">
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
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-section">
            <div className="chat-header">
              <div className="chat-info">
                <h3>Bondy Chat Support</h3>
                <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                  {isConnected ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <div className="message-sender">{message.sender}</div>
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                </div>
              ))}
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
