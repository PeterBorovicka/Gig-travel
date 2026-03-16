const express = require('express');
const { getDb } = require('../models/database');
const crypto = require('crypto');

const router = express.Router();

// Stripe is initialized lazily to allow running without a key in dev/test
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return require('stripe')(key);
}

// POST /api/bookings/tickets - Purchase tickets
router.post('/tickets', async (req, res) => {
  const { ticket_id, quantity, user_email } = req.body;

  if (!ticket_id || !quantity || !user_email) {
    return res.status(400).json({ error: 'ticket_id, quantity, and user_email are required' });
  }
  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
  }

  const db = getDb();
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticket_id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket type not found' });
  }
  if (ticket.available < quantity) {
    return res.status(400).json({ error: 'Not enough tickets available' });
  }

  const totalPrice = ticket.price * quantity;
  const bookingId = crypto.randomUUID();

  // Try Stripe payment
  const stripe = getStripe();
  let stripePaymentId = null;

  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: ticket.currency.toLowerCase(),
        metadata: { booking_id: bookingId, type: 'ticket' },
        automatic_payment_methods: { enabled: true },
      });
      stripePaymentId = paymentIntent.id;
    } catch (err) {
      return res.status(500).json({ error: 'Payment processing failed', details: err.message });
    }
  }

  // Create booking and update availability
  db.prepare('UPDATE tickets SET available = available - ? WHERE id = ?').run(quantity, ticket_id);
  db.prepare(`
    INSERT INTO bookings (id, user_email, type, reference_id, quantity, total_price, currency, stripe_payment_id, status)
    VALUES (?, ?, 'ticket', ?, ?, ?, ?, ?, ?)
  `).run(bookingId, user_email, ticket_id, quantity, totalPrice, ticket.currency, stripePaymentId, stripe ? 'pending' : 'confirmed');

  const event = db.prepare(`
    SELECT e.title, e.date, e.time, v.name as venue_name
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    JOIN tickets t ON t.event_id = e.id
    WHERE t.id = ?
  `).get(ticket_id);

  res.status(201).json({
    booking: {
      id: bookingId,
      type: 'ticket',
      event: event ? event.title : null,
      venue: event ? event.venue_name : null,
      date: event ? event.date : null,
      quantity,
      total_price: totalPrice,
      currency: ticket.currency,
      status: stripe ? 'pending' : 'confirmed',
    },
    client_secret: stripePaymentId ? `${stripePaymentId}_secret` : null,
  });
});

// POST /api/bookings/accommodations - Book accommodation
router.post('/accommodations', async (req, res) => {
  const { accommodation_id, check_in, check_out, user_email } = req.body;

  if (!accommodation_id || !check_in || !check_out || !user_email) {
    return res.status(400).json({ error: 'accommodation_id, check_in, check_out, and user_email are required' });
  }

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: 'check_out must be after check_in' });
  }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  const db = getDb();
  const accommodation = db.prepare('SELECT * FROM accommodations WHERE id = ?').get(accommodation_id);
  if (!accommodation) {
    return res.status(404).json({ error: 'Accommodation not found' });
  }
  if (accommodation.rooms_available < 1) {
    return res.status(400).json({ error: 'No rooms available' });
  }

  const totalPrice = accommodation.price_per_night * nights;
  const bookingId = crypto.randomUUID();

  // Try Stripe payment
  const stripe = getStripe();
  let stripePaymentId = null;

  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: accommodation.currency.toLowerCase(),
        metadata: { booking_id: bookingId, type: 'accommodation' },
        automatic_payment_methods: { enabled: true },
      });
      stripePaymentId = paymentIntent.id;
    } catch (err) {
      return res.status(500).json({ error: 'Payment processing failed', details: err.message });
    }
  }

  // Create booking and update availability
  db.prepare('UPDATE accommodations SET rooms_available = rooms_available - 1 WHERE id = ?').run(accommodation_id);
  db.prepare(`
    INSERT INTO bookings (id, user_email, type, reference_id, check_in, check_out, quantity, total_price, currency, stripe_payment_id, status)
    VALUES (?, ?, 'accommodation', ?, ?, ?, 1, ?, ?, ?, ?)
  `).run(bookingId, user_email, accommodation_id, check_in, check_out, totalPrice, accommodation.currency, stripePaymentId, stripe ? 'pending' : 'confirmed');

  res.status(201).json({
    booking: {
      id: bookingId,
      type: 'accommodation',
      accommodation: accommodation.name,
      city: accommodation.city,
      check_in,
      check_out,
      nights,
      total_price: totalPrice,
      currency: accommodation.currency,
      status: stripe ? 'pending' : 'confirmed',
    },
    client_secret: stripePaymentId ? `${stripePaymentId}_secret` : null,
  });
});

// GET /api/bookings/:email - Get bookings by user email
router.get('/:email', (req, res) => {
  const db = getDb();
  const bookings = db.prepare('SELECT * FROM bookings WHERE user_email = ? ORDER BY created_at DESC').all(req.params.email);
  res.json(bookings);
});

module.exports = router;
