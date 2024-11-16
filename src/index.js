const express = require('express');
const { notFound, errorHandler } = require('./middlewares'); // Adjust the path if needed
const cors = require('cors');

const app = express();

// CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  credentials: true, // Allow cookies to be sent
};

// Use CORS middleware
app.use(cors(corsOptions));

// Middleware for parsing JSON bodies
app.use(express.json());

// Define your routes here
// app.use('/api', yourRoutes); // Make sure to include your API routes

// Handle 404 errors
app.use(notFound);

// Error handler middleware
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
