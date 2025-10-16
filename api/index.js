const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('../src/middlewares');
const api = require('../src/api');
const connectDB = require('../src/api/mongodb');

const app = express();

// CORS options
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', api);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize database connection
connectDB().catch(console.error);

module.exports = app;