const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('express-async-errors');

const config = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const eventBookingRoutes = require('./routes/eventBookingRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Event Booking API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      bookings: '/api/bookings',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events/:id/bookings', eventBookingRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;