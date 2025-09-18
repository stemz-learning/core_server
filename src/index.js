const express = require('express');
const { notFound, errorHandler } = require('./middlewares'); // Adjust the path if needed
const cors = require('cors');
const connectDB = require('./api/mongodb');

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// CORS options
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies to be sent
}));

// Define your routes here
const apiRouter = require('./api'); // or however you mount src/api
app.use('/api', apiRouter);

// Handle 404 errors
app.use(notFound);

// Error handler middleware
app.use(errorHandler);

const port = process.env.PORT || 3000;

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Listening: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
