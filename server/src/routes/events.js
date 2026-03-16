const express = require('express');
const { getDb } = require('../models/database');

const router = express.Router();

// GET /api/events - List all events with optional filters
router.get('/', (req, res) => {
  const { genre, city, date, search } = req.query;
  const db = getDb();
  let query = `
    SELECT e.*, v.name as venue_name, v.city, v.country
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    WHERE 1=1
  `;
  const params = [];

  if (genre) {
    query += ' AND e.genre = ?';
    params.push(genre);
  }
  if (city) {
    query += ' AND v.city = ?';
    params.push(city);
  }
  if (date) {
    query += ' AND e.date = ?';
    params.push(date);
  }
  if (search) {
    query += ' AND (e.title LIKE ? OR e.artist LIKE ? OR e.description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY e.date';
  const events = db.prepare(query).all(...params);
  res.json(events);
});

// GET /api/events/:id - Get event details with tickets
router.get('/:id', (req, res) => {
  const db = getDb();
  const event = db.prepare(`
    SELECT e.*, v.name as venue_name, v.city, v.country, v.address as venue_address
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const tickets = db.prepare('SELECT * FROM tickets WHERE event_id = ?').all(req.params.id);
  res.json({ ...event, tickets });
});

module.exports = router;
