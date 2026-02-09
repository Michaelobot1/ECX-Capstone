const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getUserBookings,
  getEventBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Create booking validation
const createBookingValidation = [
  body('eventId').trim().notEmpty().withMessage('Event ID is required'),
  body('ticketQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Ticket quantity must be a positive number'),
  validate,
];

// Routes
router.post(
  '/',
  authenticate,
  requireRole('ATTENDEE'),
  createBookingValidation,
  createBooking
);

router.get('/', authenticate, getUserBookings);

router.delete('/:id', authenticate, cancelBooking);

module.exports = router;