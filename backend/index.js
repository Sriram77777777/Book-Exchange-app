const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow your React app's origin
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files for uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory at:', uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Error handling for static file serving
app.use('/uploads', (err, req, res, next) => {
  console.error('Static file error:', err);
  res.status(500).send('Error serving uploaded files');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/books', require('./routes/books'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room based on exchangeId
  socket.on('joinExchangeChat', (exchangeId) => {
    socket.join(exchangeId);
    console.log(`User ${socket.id} joined exchange chat: ${exchangeId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ exchangeId, message, senderId }) => {
    try {
      // Save the message to the database
      const Message = mongoose.model('Message');
      const newMessage = new Message({
        exchangeId,
        message,
        senderId,
        timestamp: Date.now(),
      });
      await newMessage.save();

      // Broadcast the message to the room
      io.to(exchangeId).emit('receiveMessage', { message, senderId, timestamp: Date.now() });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));