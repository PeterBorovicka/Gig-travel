const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const venuesRouter = require('./routes/venues');
const eventsRouter = require('./routes/events');
const accommodationsRouter = require('./routes/accommodations');
const bookingsRouter = require('./routes/bookings');
const aiRouter = require('./routes/ai');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(apiLimiter);

  // API routes
  app.use('/api/venues', venuesRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/accommodations', accommodationsRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/ai', aiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve static frontend in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
    });
  }

  return app;
}

module.exports = { createApp };
