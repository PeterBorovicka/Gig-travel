const express = require('express');
const { getDb } = require('../models/database');

const router = express.Router();

// GET /api/venues - List all venues with optional filters
router.get('/', (req, res) => {
  const { city, country, search } = req.query;
  const db = getDb();
  let query = 'SELECT * FROM venues WHERE 1=1';
  const params = [];

  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }
  if (country) {
    query += ' AND country = ?';
    params.push(country);
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR city LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY name';
  const venues = db.prepare(query).all(...params);
  res.json(venues);
});

// GET /api/venues/:id - Get venue details
router.get('/:id', (req, res) => {
  const db = getDb();
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
  if (!venue) {
    return res.status(404).json({ error: 'Venue not found' });
  }

  // Get events at this venue
  const events = db.prepare('SELECT * FROM events WHERE venue_id = ? ORDER BY date').all(req.params.id);
  res.json({ ...venue, events });
});

module.exports = router;
