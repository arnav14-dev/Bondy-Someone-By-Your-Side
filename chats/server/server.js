import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from '../../backend/src/utils/db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });

    // Handle incoming messages
    socket.on('message', (data) => {
        console.log('Message received:', data);
        
        // Broadcast to all connected clients (for admin to see)
        io.emit('admin-message', {
            message: data.message,
            userId: data.userId,
            username: data.username,
            timestamp: new Date().toISOString()
        });
        
        // Send auto-response to the sender
        socket.emit('message', {
            message: `Thank you for your message: "${data.message}". Our support team will respond shortly.`,
            timestamp: new Date().toISOString()
        });
    });

    // Handle admin responses
    socket.on('admin-response', (data) => {
        console.log('Admin response:', data);
        
        // Send admin response to specific user
        io.to(data.userId).emit('message', {
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });
});

    

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bondy Chat Server - Admin Panel</title>
            <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                .connected { background: #d4edda; color: #155724; }
                .disconnected { background: #f8d7da; color: #721c24; }
                .messages { height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
                .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
                .user-message { background: #e3f2fd; }
                .admin-message { background: #f3e5f5; }
                .input-area { display: flex; gap: 10px; margin-top: 10px; }
                input[type="text"] { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                button:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Bondy Chat Server - Admin Panel</h1>
                <div id="status" class="status">Connecting...</div>
                <div id="messages" class="messages"></div>
                <div class="input-area">
                    <input type="text" id="messageInput" placeholder="Type admin response..." disabled>
                    <button id="sendBtn" onclick="sendMessage()" disabled>Send</button>
                </div>
            </div>
            
            <script>
                const socket = io();
                let currentUserId = null;
                
                socket.on('connect', () => {
                    document.getElementById('status').innerHTML = 'Connected! Socket ID: ' + socket.id;
                    document.getElementById('status').className = 'status connected';
                    console.log('Connected to server with ID:', socket.id);
                });
                
                socket.on('disconnect', () => {
                    document.getElementById('status').innerHTML = 'Disconnected';
                    document.getElementById('status').className = 'status disconnected';
                    console.log('Disconnected from server');
                });
                
                socket.on('admin-message', (data) => {
                    currentUserId = data.userId;
                    addMessage('User: ' + data.username, data.message, 'user-message');
                    document.getElementById('messageInput').disabled = false;
                    document.getElementById('sendBtn').disabled = false;
                });
                
                function addMessage(sender, message, className) {
                    const messagesDiv = document.getElementById('messages');
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message ' + className;
                    messageDiv.innerHTML = '<strong>' + sender + ':</strong> ' + message;
                    messagesDiv.appendChild(messageDiv);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
                
                function sendMessage() {
                    const input = document.getElementById('messageInput');
                    const message = input.value.trim();
                    if (message && currentUserId) {
                        socket.emit('admin-response', {
                            userId: currentUserId,
                            message: message
                        });
                        addMessage('Admin', message, 'admin-message');
                        input.value = '';
                    }
                }
                
                document.getElementById('messageInput').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
            </script>
        </body>
        </html>
    `);
});

const startServer = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');
        server.listen(3005, () => {
            console.log('Server is running on port 3005');
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

startServer();