const request = require('supertest');
const { createApp } = require('../src/app');
const { getDb, seedDb, closeDb } = require('../src/models/database');
const path = require('path');

let app;

beforeAll(() => {
  // Use in-memory-like temp database for tests
  process.env.DB_PATH = path.join(__dirname, 'test_gig_travel.sqlite');
  app = createApp();
  seedDb();
});

afterAll(() => {
  closeDb();
  // Clean up test database
  const fs = require('fs');
  const testDb = path.join(__dirname, 'test_gig_travel.sqlite');
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
});

describe('Health Check', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Venues API', () => {
  test('GET /api/venues returns list of venues', async () => {
    const res = await request(app).get('/api/venues');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('city');
    expect(res.body[0]).toHaveProperty('country');
  });

  test('GET /api/venues?city=London filters by city', async () => {
    const res = await request(app).get('/api/venues?city=London');
    expect(res.status).toBe(200);
    expect(res.body.every(v => v.city === 'London')).toBe(true);
  });

  test('GET /api/venues?search=Arena searches venues', async () => {
    const res = await request(app).get('/api/venues?search=Arena');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/venues/:id returns venue with events', async () => {
    const venues = await request(app).get('/api/venues');
    const venueId = venues.body[0].id;
    const res = await request(app).get(`/api/venues/${venueId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('events');
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  test('GET /api/venues/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/venues/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('Events API', () => {
  test('GET /api/events returns list of events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('venue_name');
  });

  test('GET /api/events?genre=Rock filters by genre', async () => {
    const res = await request(app).get('/api/events?genre=Rock');
    expect(res.status).toBe(200);
    expect(res.body.every(e => e.genre === 'Rock')).toBe(true);
  });

  test('GET /api/events/:id returns event with tickets', async () => {
    const events = await request(app).get('/api/events');
    const eventId = events.body[0].id;
    const res = await request(app).get(`/api/events/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tickets');
    expect(Array.isArray(res.body.tickets)).toBe(true);
    expect(res.body.tickets.length).toBeGreaterThan(0);
  });

  test('GET /api/events/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/events/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('Accommodations API', () => {
  test('GET /api/accommodations returns list', async () => {
    const res = await request(app).get('/api/accommodations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('price_per_night');
  });

  test('GET /api/accommodations?city=Paris filters by city', async () => {
    const res = await request(app).get('/api/accommodations?city=Paris');
    expect(res.status).toBe(200);
    expect(res.body.every(a => a.city === 'Paris')).toBe(true);
  });

  test('GET /api/accommodations/:id returns accommodation', async () => {
    const accommodations = await request(app).get('/api/accommodations');
    const id = accommodations.body[0].id;
    const res = await request(app).get(`/api/accommodations/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
  });

  test('GET /api/accommodations/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/accommodations/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('Bookings API', () => {
  test('POST /api/bookings/tickets creates a ticket booking', async () => {
    const events = await request(app).get('/api/events');
    const eventId = events.body[0].id;
    const eventDetail = await request(app).get(`/api/events/${eventId}`);
    const ticketId = eventDetail.body.tickets[0].id;

    const res = await request(app)
      .post('/api/bookings/tickets')
      .send({ ticket_id: ticketId, quantity: 2, user_email: 'test@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.booking).toHaveProperty('id');
    expect(res.body.booking.type).toBe('ticket');
    expect(res.body.booking.quantity).toBe(2);
    expect(res.body.booking.status).toBe('confirmed');
  });

  test('POST /api/bookings/tickets validates required fields', async () => {
    const res = await request(app)
      .post('/api/bookings/tickets')
      .send({ ticket_id: 'some-id' });

    expect(res.status).toBe(400);
  });

  test('POST /api/bookings/tickets rejects invalid quantity', async () => {
    const res = await request(app)
      .post('/api/bookings/tickets')
      .send({ ticket_id: 'some-id', quantity: 0, user_email: 'test@example.com' });

    expect(res.status).toBe(400);
  });

  test('POST /api/bookings/accommodations creates a booking', async () => {
    const accommodations = await request(app).get('/api/accommodations');
    const accId = accommodations.body[0].id;

    const res = await request(app)
      .post('/api/bookings/accommodations')
      .send({
        accommodation_id: accId,
        check_in: '2026-07-01',
        check_out: '2026-07-05',
        user_email: 'test@example.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.booking).toHaveProperty('id');
    expect(res.body.booking.type).toBe('accommodation');
    expect(res.body.booking.nights).toBe(4);
  });

  test('POST /api/bookings/accommodations validates dates', async () => {
    const res = await request(app)
      .post('/api/bookings/accommodations')
      .send({
        accommodation_id: 'some-id',
        check_in: '2026-07-05',
        check_out: '2026-07-01',
        user_email: 'test@example.com',
      });

    expect(res.status).toBe(400);
  });

  test('GET /api/bookings/:email returns user bookings', async () => {
    const res = await request(app).get('/api/bookings/test@example.com');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
