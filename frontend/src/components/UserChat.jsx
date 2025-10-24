import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Phone, Video, MoreVertical } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import '../styles/UserChat.css';

const UserChat = ({ user, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (user) {
      initializeSocket();
      loadConversation();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const newSocket = io(import.meta.env.VITE_CHAT_URL || 'http://localhost:3005');
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('join-user', user._id);
    });

    newSocket.on('message-received', (data) => {
      if (data.conversationId === conversation?._id) {
        loadMessages();
      }
    });

    newSocket.on('user-typing', (data) => {
      if (data.conversationId === conversation?._id) {
        setIsTyping(data.isTyping);
      }
    });

    newSocket.on('conversation-status-changed', (data) => {
      if (data.conversationId === conversation?._id) {
        loadConversation();
      }
    });

    setSocket(newSocket);
  };

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/user/conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: 'Live Chat Support',
          priority: 'normal'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(data.data.conversation);
        await loadMessages();
      } else {
        toast.error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Error starting chat');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/user/conversation/${conversation._id}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || !socket) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/user/conversation/${conversation._id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageContent,
          messageType: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data.message]);
        
        // Emit to socket
        socket.emit('new-message', {
          conversationId: conversation._id,
          message: data.data.message,
          senderType: 'user'
        });
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && conversation) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing start
      socket.emit('typing', {
        conversationId: conversation._id,
        isTyping: true,
        senderType: 'user'
      });

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          conversationId: conversation._id,
          isTyping: false,
          senderType: 'user'
        });
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusText = () => {
    if (!conversation) return 'Connecting...';
    
    switch (conversation.status) {
      case 'waiting':
        return 'Waiting for admin...';
      case 'active':
        return conversation.assignedAdmin ? 'Admin is online' : 'Admin connected';
      case 'closed':
        return 'Chat ended';
      default:
        return 'Connecting...';
    }
  };

  const getStatusColor = () => {
    if (!conversation) return '#f59e0b';
    
    switch (conversation.status) {
      case 'waiting':
        return '#f59e0b';
      case 'active':
        return '#10b981';
      case 'closed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={24} />
        <span>Live Chat</span>
      </button>
    );
  }

  return (
    <div className="user-chat-container">
      <div className="chat-header">
        <div className="chat-info">
          <h3>Live Chat Support</h3>
          <div className="chat-status">
            <div 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor() }}
            ></div>
            <span>{getStatusText()}</span>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn">
            <Phone size={16} />
          </button>
          <button className="action-btn">
            <Video size={16} />
          </button>
          <button className="action-btn">
            <MoreVertical size={16} />
          </button>
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {isLoading ? (
          <div className="loading-messages">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div 
              key={message._id} 
              className={`message ${message.sender.role === 'user' ? 'user-message' : 'admin-message'}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="sender-name">
                    {message.sender.role === 'user' ? 'You' : message.sender.name}
                  </span>
                  <span className="message-time">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <div className="message-text">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            <MessageCircle size={48} />
            <p>Start a conversation with our support team</p>
          </div>
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Admin is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            rows="1"
            disabled={!conversation || conversation.status === 'closed'}
          />
          <button 
            className="send-btn"
            onClick={sendMessage}
            disabled={!newMessage.trim() || !conversation || conversation.status === 'closed'}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
