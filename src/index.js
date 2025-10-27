const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares');
const api = require('./api');
const connectDB = require('./api/mongodb');

const app = express();
const server = http.createServer(app);

// CORS options
const corsOptions = {
  origin: '*', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  credentials: true, // Allow cookies to be sent
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: corsOptions,
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Rest of your middleware and routes...
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', api);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => { // Use server instead of app
      console.log(`Listening: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, startServer };
