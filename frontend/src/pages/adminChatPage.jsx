import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  User, 
  Clock,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import '../styles/adminChatPage.css';

const AdminChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_CHAT_URL || 'http://localhost:3005');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Admin connected to chat server');
      setIsConnected(true);
      
      // Join admin room
      const adminId = localStorage.getItem('adminId');
      if (adminId) {
        newSocket.emit('join-admin', adminId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Admin disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('new-user-message', (data) => {
      console.log('New user message received:', data);
      // Refresh conversations to show updated last message
      loadConversations();
      
      // If this message is for the currently selected conversation, add it to messages
      if (selectedConversation && selectedConversation._id === data.conversationId) {
        loadMessages(data.conversationId);
      }
    });

    newSocket.on('message-received', (data) => {
      console.log('Message received:', data);
      if (selectedConversation && selectedConversation._id === data.conversationId) {
        loadMessages(data.conversationId);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [selectedConversation]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    const adminToken = localStorage.getItem('adminToken');
    console.log('Admin token found:', !!adminToken);
    
    if (!adminToken) {
      console.error('No admin token found');
      navigate('/admin/login');
      return;
    }

    try {
      console.log('Fetching admin conversations...');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/admin/conversations`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('Admin conversations response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin conversations data:', data);
        if (data.success && data.data && Array.isArray(data.data.conversations)) {
          console.log('Found conversations:', data.data.conversations.length);
          setConversations(data.data.conversations);
        } else {
          console.error('Invalid data format:', data);
          setConversations([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load conversations:', response.status, errorText);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/admin/conversation/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data.messages)) {
          setMessages(data.data.messages);
        } else {
          console.error('Invalid messages data format:', data);
          setMessages([]);
        }
      } else {
        console.error('Failed to load messages:', response.status);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/admin/conversation/${selectedConversation._id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: newMessage.trim(),
          senderType: 'admin'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Emit socket event for real-time updates
          socket.emit('new-message', {
            conversationId: selectedConversation._id,
            message: data.data,
            senderType: 'admin'
          });
          
          setNewMessage('');
          // Reload messages to get the latest
          loadMessages(selectedConversation._id);
        }
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const filteredConversations = (conversations || []).filter(conv => {
    const matchesSearch = conv.participants?.some(participant => 
      participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || false;
    
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'resolved':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="admin-chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Admin Chat</h1>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="chat-container">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <h3>Conversations ({filteredConversations.length})</h3>
          </div>
          
          {loading ? (
            <div className="loading">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <MessageCircle size={48} />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="conversations-list">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation._id}
                  className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    <User size={20} />
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h4>{conversation.participants[0]?.name || 'Unknown User'}</h4>
                      <span className="conversation-time">
                        {formatDate(conversation.lastMessage?.createdAt || conversation.createdAt)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <p>{conversation.lastMessage?.content || 'No messages yet'}</p>
                      <div className="conversation-meta">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(conversation.status) }}
                        >
                          {conversation.status}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="unread-count">{conversation.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div className="user-info">
                  <div className="user-avatar">
                    <User size={24} />
                  </div>
                  <div className="user-details">
                    <h3>{selectedConversation.participants[0]?.name || 'Unknown User'}</h3>
                    <p>{selectedConversation.participants[0]?.email || 'No email provided'}</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn">
                    <Phone size={16} />
                  </button>
                  <button className="action-btn">
                    <Mail size={16} />
                  </button>
                  <button className="action-btn">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <MessageCircle size={48} />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map(message => (
                      <div
                        key={message._id}
                        className={`message ${message.senderType === 'admin' ? 'admin-message' : 'user-message'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <div className="message-input">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isConnected}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="send-btn"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageCircle size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
