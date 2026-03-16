const express = require('express');
const { getDb } = require('../models/database');

const router = express.Router();

// GET /api/accommodations - List all accommodations
router.get('/', (req, res) => {
  const { city, country, min_price, max_price, search } = req.query;
  const db = getDb();
  let query = 'SELECT * FROM accommodations WHERE 1=1';
  const params = [];

  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }
  if (country) {
    query += ' AND country = ?';
    params.push(country);
  }
  if (min_price) {
    query += ' AND price_per_night >= ?';
    params.push(Number(min_price));
  }
  if (max_price) {
    query += ' AND price_per_night <= ?';
    params.push(Number(max_price));
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR city LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY rating DESC';
  const accommodations = db.prepare(query).all(...params);
  res.json(accommodations);
});

// GET /api/accommodations/:id - Get accommodation details
router.get('/:id', (req, res) => {
  const db = getDb();
  const accommodation = db.prepare('SELECT * FROM accommodations WHERE id = ?').get(req.params.id);
  if (!accommodation) {
    return res.status(404).json({ error: 'Accommodation not found' });
  }
  res.json(accommodation);
});

module.exports = router;
