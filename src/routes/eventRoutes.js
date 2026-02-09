const express = require('express');
const { body } = require('express-validator');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Create event validation
const createEventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('totalSeats')
    .isInt({ min: 1 })
    .withMessage('Total seats must be a positive number'),
  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a positive number'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Invalid status'),
  validate,
];

// Update event validation
const updateEventValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('totalSeats')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total seats must be a positive number'),
  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a positive number'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Invalid status'),
  validate,
];

// Routes
router.post(
  '/',
  authenticate,
  requireRole('ORGANIZER'),
  createEventValidation,
  createEvent
);

router.get('/', getEvents);
router.get('/:id', getEventById);

router.put(
  '/:id',
  authenticate,
  requireRole('ORGANIZER'),
  updateEventValidation,
  updateEvent
);

router.delete('/:id', authenticate, requireRole('ORGANIZER'), deleteEvent);

module.exports = router;