# Event Booking & Ticketing API

A robust, production-ready event booking and ticketing API built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 🚀 Features

- ✅ **JWT Authentication** - Secure user registration and login
- ✅ **Role-Based Access Control** - Organizers and Attendees with distinct permissions
- ✅ **Event Management** - Full CRUD operations for events
- ✅ **Ticket Booking System** - Atomic seat reservation with race condition handling
- ✅ **Multi-Tenant Data Isolation** - Users can only access their own data
- ✅ **Advanced Filtering & Pagination** - Search events by date, location, status
- ✅ **RESTful API Design** - Industry-standard endpoints and HTTP methods
- ✅ **Comprehensive Error Handling** - Centralized error management
- ✅ **Input Validation** - Request validation with express-validator
- ✅ **Database Transactions** - Ensure data consistency during bookings

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd event-booking-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/event_booking_db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
```

### 4. Set up the database
```bash
# Create the database
createdb event_booking_db

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run migrate
```

### 5. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "ATTENDEE"  // or "ORGANIZER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "ATTENDEE",
      "createdAt": "2025-02-09T10:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Event Endpoints

#### Create Event (Organizer Only)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference",
  "location": "Lagos, Nigeria",
  "date": "2025-03-15T10:00:00.000Z",
  "ticketPrice": 5000,
  "totalSeats": 100,
  "status": "PUBLISHED"
}
```

#### Get All Events (Public)
```http
GET /api/events?page=1&limit=10&status=PUBLISHED&location=Lagos&date=upcoming
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Results per page (default: 10)
- `status` (optional) - Filter by status: DRAFT, PUBLISHED, CANCELLED
- `location` (optional) - Filter by location (case-insensitive search)
- `date` (optional) - Filter by date ("upcoming" or specific date "2025-03-15")

#### Get Event by ID
```http
GET /api/events/:id
```

#### Update Event (Organizer Only)
```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Event Title",
  "totalSeats": 150
}
```

#### Delete Event (Organizer Only)
```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

### Booking Endpoints

#### Create Booking (Attendee Only)
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event-uuid",
  "ticketQuantity": 2
}
```

#### Get User Bookings
```http
GET /api/bookings?page=1&limit=10&status=CONFIRMED
Authorization: Bearer <token>
```

#### Get Event Bookings (Organizer Only)
```http
GET /api/events/:id/bookings
Authorization: Bearer <token>
```

#### Cancel Booking
```http
DELETE /api/bookings/:id
Authorization: Bearer <token>
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

### ORGANIZER
- Create, update, and delete events
- View bookings for their events
- Cannot book tickets

### ATTENDEE
- Book tickets for events
- View their own bookings
- Cancel their bookings
- Cannot create or manage events

## 🗄️ Database Schema

### Users
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `role` (ORGANIZER | ATTENDEE)
- `createdAt`, `updatedAt`

### Events
- `id` (UUID, Primary Key)
- `title`
- `description`
- `location`
- `date`
- `ticketPrice`
- `totalSeats`
- `remainingSeats`
- `status` (DRAFT | PUBLISHED | CANCELLED)
- `organizerId` (Foreign Key)
- `createdAt`, `updatedAt`

### Bookings
- `id` (UUID, Primary Key)
- `eventId` (Foreign Key)
- `userId` (Foreign Key)
- `ticketQuantity`
- `status` (PENDING | CONFIRMED | CANCELLED)
- `createdAt`, `updatedAt`
- Unique constraint on (eventId, userId)

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Endpoint protection based on user roles
4. **Input Validation**: All requests are validated
5. **Helmet.js**: Security headers
6. **CORS**: Configurable cross-origin resource sharing
7. **Multi-Tenant Isolation**: Users can only access their own data

## 🚦 Business Logic

### Booking Rules
- ✅ Users cannot book the same event twice
- ✅ Bookings fail if event is cancelled
- ✅ Bookings fail if event is full
- ✅ Bookings fail if event date has passed
- ✅ Seat count updates atomically (no overbooking)
- ✅ Cancelled bookings restore seats to the event

### Event Rules
- ✅ Only organizers can create events
- ✅ Organizers can only manage their own events
- ✅ Cannot reduce total seats below booked seats
- ✅ Event cancellation prevents new bookings

## 📦 Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL` (from Render PostgreSQL)
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Start command: `npm start`

### Deploy to Railway

1. Create new project
2. Add PostgreSQL database
3. Deploy from GitHub
4. Set environment variables
5. Railway auto-detects Node.js and runs the app

## 🧪 Testing the API

You can test the API using:
- **Postman**: Import the endpoints
- **cURL**: Command-line testing
- **Thunder Client** (VS Code extension)

### Example cURL Request
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "password123",
    "name": "Event Organizer",
    "role": "ORGANIZER"
  }'

# Create event
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Tech Conference",
    "description": "Annual tech event",
    "location": "Lagos",
    "date": "2025-03-15T10:00:00Z",
    "ticketPrice": 5000,
    "totalSeats": 100,
    "status": "PUBLISHED"
  }'
```

## 📁 Project Structure
```
event-booking-api/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client config
│   │   └── env.js             # Environment variables
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── eventController.js # Event logic
│   │   └── bookingController.js # Booking logic
│   ├── middleware/
│   │   ├── auth.js            # Authentication & authorization
│   │   ├── errorHandler.js    # Error handling
│   │   └── validation.js      # Request validation
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── eventRoutes.js     # Event endpoints
│   │   ├── bookingRoutes.js   # Booking endpoints
│   │   └── eventBookingRoutes.js
│   ├── utils/
│   │   ├── errors.js          # Custom error classes
│   │   └── jwt.js             # JWT utilities
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🐛 Error Handling

All errors return a consistent format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate booking, etc.)
- `500` - Internal Server Error

## 👨‍💻 Development

### Database Management
```bash
# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Create a new migration
npm run migrate

# Reset database
npx prisma migrate reset
```

### Code Quality

The codebase follows these principles:
- ✅ Separation of concerns
- ✅ DRY (Don't Repeat Yourself)
- ✅ RESTful conventions
- ✅ Async/await error handling
- ✅ Input validation
- ✅ Transaction-based operations

## 🎯 Requirements Met

### ✅ Authentication & Authorization
- [x] User registration and login
- [x] Password hashing
- [x] JWT authentication
- [x] Protected routes
- [x] Role-based access control

### ✅ Event Management
- [x] CRUD operations
- [x] Event status management
- [x] Pagination and filtering
- [x] Organizer-only access

### ✅ Booking System
- [x] Atomic seat reservation
- [x] Duplicate booking prevention
- [x] Business logic validation
- [x] Transaction handling

### ✅ Database
- [x] PostgreSQL with Prisma
- [x] Proper schema design
- [x] Relationships and indexes
- [x] Migration support

### ✅ API Design
- [x] RESTful endpoints
- [x] Proper HTTP status codes
- [x] Error handling
- [x] Input validation

### ✅ Documentation
- [x] Complete README
- [x] API documentation
- [x] Setup instructions

### ✅ Deployment Ready
- [x] Environment variables
- [x] Production configuration
- [x] Deployment guides

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, PostgreSQL, and Prisma**
