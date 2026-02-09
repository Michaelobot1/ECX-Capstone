const prisma = require('../config/database');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

const createEvent = async (req, res, next) => {
  try {
    const { title, description, location, date, ticketPrice, totalSeats, status } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        ticketPrice: parseFloat(ticketPrice) || 0,
        totalSeats: parseInt(totalSeats),
        remainingSeats: parseInt(totalSeats),
        status: status || 'DRAFT',
        organizerId: req.user.id,
      },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, location, date } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (date) {
      if (date === 'upcoming') {
        where.date = {
          gte: new Date(),
        };
      } else {
        const searchDate = new Date(date);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.date = {
          gte: searchDate,
          lt: nextDay,
        };
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'asc' },
        include: {
          organizer: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
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

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    res.json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, location, date, ticketPrice, totalSeats, status } = req.body;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.organizerId !== req.user.id) {
      throw new ForbiddenError('You can only update your own events');
    }

    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (date !== undefined) updateData.date = new Date(date);
    if (ticketPrice !== undefined) updateData.ticketPrice = parseFloat(ticketPrice);
    if (status !== undefined) updateData.status = status.toUpperCase();
    
    if (totalSeats !== undefined) {
      const newTotalSeats = parseInt(totalSeats);
      const bookedSeats = event.totalSeats - event.remainingSeats;
      
      if (newTotalSeats < bookedSeats) {
        throw new ValidationError('Cannot reduce seats below number of bookings');
      }
      
      updateData.totalSeats = newTotalSeats;
      updateData.remainingSeats = newTotalSeats - bookedSeats;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent },
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.organizerId !== req.user.id) {
      throw new ForbiddenError('You can only delete your own events');
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};