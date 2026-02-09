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