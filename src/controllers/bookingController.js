const prisma = require('../config/database');
const { NotFoundError, ForbiddenError, ValidationError, ConflictError } = require('../utils/errors');

const createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketQuantity = 1 } = req.body;
    const userId = req.user.id;

    // Use transaction for atomic booking
    const booking = await prisma.$transaction(async (tx) => {
      // Get event with lock
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Validation checks
      if (event.status === 'CANCELLED') {
        throw new ValidationError('Cannot book tickets for a cancelled event');
      }

      if (event.status === 'DRAFT') {
        throw new ValidationError('Cannot book tickets for an unpublished event');
      }

      if (new Date(event.date) < new Date()) {
        throw new ValidationError('Cannot book tickets for a past event');
      }

      if (event.remainingSeats < ticketQuantity) {
        throw new ValidationError(`Only ${event.remainingSeats} seats available`);
      }

      // Check for duplicate booking
      const existingBooking = await tx.booking.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

      if (existingBooking) {
        throw new ConflictError('You have already booked this event');
      }

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          eventId,
          userId,
          ticketQuantity: parseInt(ticketQuantity),
          status: 'CONFIRMED',
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              ticketPrice: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update remaining seats atomically
      await tx.event.update({
        where: { id: eventId },
        data: {
          remainingSeats: {
            decrement: parseInt(ticketQuantity),
          },
        },
      });

      return newBooking;
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };

    if (status) {
      where.status = status.toUpperCase();
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              date: true,
              ticketPrice: true,
              status: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEventBookings = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify event exists and user is the organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.organizerId !== req.user.id) {
      throw new ForbiddenError('You can only view bookings for your own events');
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { eventId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.booking.count({ where: { eventId } }),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.userId !== req.user.id) {
      throw new ForbiddenError('You can only cancel your own bookings');
    }

    if (booking.status === 'CANCELLED') {
      throw new ValidationError('Booking is already cancelled');
    }

    // Use transaction to cancel booking and restore seats
    await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      }),
      prisma.event.update({
        where: { id: booking.eventId },
        data: {
          remainingSeats: {
            increment: booking.ticketQuantity,
          },
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getEventBookings,
  cancelBooking,
};