const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'gig_travel.sqlite');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      capacity INTEGER,
      image_url TEXT,
      latitude REAL,
      longitude REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      venue_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      artist TEXT,
      genre TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (venue_id) REFERENCES venues(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      available INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS accommodations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      price_per_night REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      rooms_available INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      amenities TEXT,
      rating REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('ticket', 'accommodation')),
      reference_id TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      total_price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      stripe_payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedDb(database) {
  const db = database || getDb();
  const venueCount = db.prepare('SELECT COUNT(*) as count FROM venues').get();
  if (venueCount.count > 0) return;

  const crypto = require('crypto');
  const uuidv4 = () => crypto.randomUUID();

  const venues = [
    { id: uuidv4(), name: 'O2 Arena', description: 'Premier entertainment venue in London', address: 'Peninsula Square', city: 'London', country: 'United Kingdom', capacity: 20000, image_url: '/images/o2-arena.jpg', latitude: 51.503, longitude: 0.003 },
    { id: uuidv4(), name: 'Madison Square Garden', description: 'The world\'s most famous arena', address: '4 Pennsylvania Plaza', city: 'New York', country: 'United States', capacity: 20789, image_url: '/images/msg.jpg', latitude: 40.7505, longitude: -73.9934 },
    { id: uuidv4(), name: 'Ziggo Dome', description: 'State-of-the-art music venue in Amsterdam', address: 'De Passage 100', city: 'Amsterdam', country: 'Netherlands', capacity: 17000, image_url: '/images/ziggo-dome.jpg', latitude: 52.3142, longitude: 4.9369 },
    { id: uuidv4(), name: 'Accor Arena', description: 'Largest indoor arena in France', address: '8 Boulevard de Bercy', city: 'Paris', country: 'France', capacity: 20300, image_url: '/images/accor-arena.jpg', latitude: 48.8386, longitude: 2.3786 },
    { id: uuidv4(), name: 'Scotiabank Arena', description: 'Premier arena in downtown Toronto', address: '40 Bay Street', city: 'Toronto', country: 'Canada', capacity: 19800, image_url: '/images/scotiabank.jpg', latitude: 43.6435, longitude: -79.3791 },
    { id: uuidv4(), name: 'Mercedes-Benz Arena', description: 'Modern multi-purpose arena in Berlin', address: 'Mercedes-Platz 1', city: 'Berlin', country: 'Germany', capacity: 17000, image_url: '/images/mercedes-arena.jpg', latitude: 52.5075, longitude: 13.4431 },
  ];

  const insertVenue = db.prepare('INSERT INTO venues (id, name, description, address, city, country, capacity, image_url, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const v of venues) {
    insertVenue.run(v.id, v.name, v.description, v.address, v.city, v.country, v.capacity, v.image_url, v.latitude, v.longitude);
  }

  const events = [
    { id: uuidv4(), venue_id: venues[0].id, title: 'Rock Legends Live', description: 'An unforgettable night of classic rock', date: '2026-06-15', time: '20:00', artist: 'The Rolling Stones', genre: 'Rock', image_url: '/images/rock-legends.jpg' },
    { id: uuidv4(), venue_id: venues[1].id, title: 'Jazz Night NYC', description: 'World-class jazz performances', date: '2026-07-20', time: '19:30', artist: 'Wynton Marsalis', genre: 'Jazz', image_url: '/images/jazz-night.jpg' },
    { id: uuidv4(), venue_id: venues[2].id, title: 'Electronic Beats Festival', description: 'Top DJs from around the world', date: '2026-08-10', time: '21:00', artist: 'Various Artists', genre: 'Electronic', image_url: '/images/electronic-beats.jpg' },
    { id: uuidv4(), venue_id: venues[3].id, title: 'Paris Opera Gala', description: 'A night of opera classics', date: '2026-09-05', time: '19:00', artist: 'Paris Opera Orchestra', genre: 'Classical', image_url: '/images/opera-gala.jpg' },
    { id: uuidv4(), venue_id: venues[4].id, title: 'Hip Hop Summit', description: 'The biggest names in hip hop', date: '2026-10-12', time: '20:30', artist: 'Various Artists', genre: 'Hip Hop', image_url: '/images/hiphop-summit.jpg' },
    { id: uuidv4(), venue_id: venues[5].id, title: 'Techno Underground', description: 'Berlin\'s finest techno night', date: '2026-11-01', time: '22:00', artist: 'Various Artists', genre: 'Techno', image_url: '/images/techno-underground.jpg' },
  ];

  const insertEvent = db.prepare('INSERT INTO events (id, venue_id, title, description, date, time, artist, genre, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const e of events) {
    insertEvent.run(e.id, e.venue_id, e.title, e.description, e.date, e.time, e.artist, e.genre, e.image_url);
  }

  const tickets = [];
  for (const e of events) {
    tickets.push(
      { id: uuidv4(), event_id: e.id, type: 'General Admission', price: 59.99, currency: 'EUR', available: 500 },
      { id: uuidv4(), event_id: e.id, type: 'VIP', price: 149.99, currency: 'EUR', available: 100 },
      { id: uuidv4(), event_id: e.id, type: 'Premium', price: 249.99, currency: 'EUR', available: 50 }
    );
  }

  const insertTicket = db.prepare('INSERT INTO tickets (id, event_id, type, price, currency, available) VALUES (?, ?, ?, ?, ?, ?)');
  for (const t of tickets) {
    insertTicket.run(t.id, t.event_id, t.type, t.price, t.currency, t.available);
  }

  const accommodations = [
    { id: uuidv4(), name: 'The Grand London Hotel', description: 'Luxury hotel near O2 Arena', address: '1 Park Lane', city: 'London', country: 'United Kingdom', price_per_night: 189.00, currency: 'GBP', rooms_available: 25, image_url: '/images/grand-london.jpg', amenities: 'WiFi,Pool,Spa,Restaurant,Bar', rating: 4.5 },
    { id: uuidv4(), name: 'Manhattan Suites', description: 'Modern suites in the heart of NYC', address: '350 West 34th St', city: 'New York', country: 'United States', price_per_night: 229.00, currency: 'USD', rooms_available: 30, image_url: '/images/manhattan-suites.jpg', amenities: 'WiFi,Gym,Restaurant,Rooftop Bar', rating: 4.3 },
    { id: uuidv4(), name: 'Canal View Amsterdam', description: 'Charming boutique hotel on the canals', address: 'Herengracht 255', city: 'Amsterdam', country: 'Netherlands', price_per_night: 165.00, currency: 'EUR', rooms_available: 15, image_url: '/images/canal-view.jpg', amenities: 'WiFi,Breakfast,Bike Rental', rating: 4.7 },
    { id: uuidv4(), name: 'Le Parisien Boutique', description: 'Elegant Parisian hotel near Bercy', address: '12 Rue de Lyon', city: 'Paris', country: 'France', price_per_night: 195.00, currency: 'EUR', rooms_available: 20, image_url: '/images/le-parisien.jpg', amenities: 'WiFi,Breakfast,Wine Bar,Concierge', rating: 4.6 },
    { id: uuidv4(), name: 'Toronto Waterfront Inn', description: 'Comfortable stay on Lake Ontario', address: '33 Bay St', city: 'Toronto', country: 'Canada', price_per_night: 175.00, currency: 'CAD', rooms_available: 40, image_url: '/images/waterfront-inn.jpg', amenities: 'WiFi,Pool,Gym,Restaurant', rating: 4.2 },
    { id: uuidv4(), name: 'Berlin Mitte Hotel', description: 'Modern hotel in central Berlin', address: 'Alexanderplatz 5', city: 'Berlin', country: 'Germany', price_per_night: 135.00, currency: 'EUR', rooms_available: 35, image_url: '/images/berlin-mitte.jpg', amenities: 'WiFi,Breakfast,Bar,Sauna', rating: 4.4 },
  ];

  const insertAccommodation = db.prepare('INSERT INTO accommodations (id, name, description, address, city, country, price_per_night, currency, rooms_available, image_url, amenities, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const a of accommodations) {
    insertAccommodation.run(a.id, a.name, a.description, a.address, a.city, a.country, a.price_per_night, a.currency, a.rooms_available, a.image_url, a.amenities, a.rating);
  }
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, seedDb, closeDb, initializeDb };
