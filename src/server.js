const app = require('./app');
const config = require('./config/env');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Event Booking API Server                            ║
╚═══════════════════════════════════════════════════════╝

🚀 Server running on port: ${PORT}
🌍 Environment: ${config.env}
📡 API Base URL: http://localhost:${PORT}
📚 Health Check: http://localhost:${PORT}/health

Available Endpoints:
  - POST   /api/auth/register
  - POST   /api/auth/login
  - GET    /api/auth/profile
  - POST   /api/events
  - GET    /api/events
  - GET    /api/events/:id
  - PUT    /api/events/:id
  - DELETE /api/events/:id
  - POST   /api/bookings
  - GET    /api/bookings
  - GET    /api/events/:id/bookings
  - DELETE /api/bookings/:id

Press Ctrl+C to stop the server
  `);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️  Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;