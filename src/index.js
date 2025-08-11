const express = require('express');
const { notFound, errorHandler } = require('./middlewares'); // Adjust the path if needed
const cors = require('cors');
const api = require('./api');
const connectDB = require('./api/mongodb');

const app = express();

const allowedOrigins = ['http://localhost:3001', 'https://teachers.stemzlearning.org'];

// CORS options
// const corsOptions = {
//   origin: 'http://localhost:3001', // Allow requests from your frontend
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
//   credentials: true, // Allow cookies to be sent
// };

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser clients (curl, Postman)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

// Use CORS middleware
app.use(cors(corsOptions));

// Middleware for parsing JSON bodies
app.use(express.json());

// Define your routes here
// app.use('/api', yourRoutes); // Make sure to include your API routes
app.use('/api', api);

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
