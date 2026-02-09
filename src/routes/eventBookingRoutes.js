const express = require('express');
const { getEventBookings } = require('../controllers/bookingController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Get all bookings for a specific event (organizer only)
router.get('/', authenticate, requireRole('ORGANIZER'), getEventBookings);

module.exports = router;