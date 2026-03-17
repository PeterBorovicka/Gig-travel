# Gig Travel 🎵🌍

**One click from the show to your seat, your room, and your ride.**

Gig Travel is for the music fan who sees a concert announcement and wants to
book *everything* — tickets, accommodation, and travel — in a single flow.
Pick a show, choose your tier, find a nearby hotel, and check out once.

## How It Works

1. **Find a show** — Search by artist, genre, or city.
2. **Grab your tickets** — General Admission, VIP, or Premium.
3. **Complete your trip** — The event page surfaces nearby hotels so you can
   book a room right alongside your tickets.
4. **Pay once** — Secure Stripe checkout for every part of the trip.

## Features

- **🎫 One-Click Show + Stay** — Buy tickets and book a hotel from the same event page.
- **🔍 Discover Events** — Browse concerts and festivals across Europe and North America.
- **🏨 Nearby Accommodations** — Hotels near the venue are surfaced automatically.
- **💳 Stripe Payments** — Visa, Mastercard, Apple Pay, Google Pay.
- **📋 My Bookings** — Look up all your trip details with an email address.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router 7 |
| Backend | Node.js, Express 5 |
| Database | SQLite (via better-sqlite3) |
| Payments | Stripe |
| Styling | Custom CSS with CSS variables |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running in Development

```bash
# Terminal 1: Start the API server (port 3001)
cd server && npm run dev

# Terminal 2: Start the React dev server (port 5173)
cd client && npm run dev
```

The Vite dev server proxies API requests to the backend automatically.

### Environment Variables

Create a `server/.env` file for Stripe integration:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
PORT=3001
```

> Without a Stripe key, bookings are confirmed immediately (useful for development).

### Running Tests

```bash
cd server && npm test
```

### Building for Production

```bash
cd client && npm run build
```

The built files are served by Express in production mode.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (filter: genre, city, date, search) |
| GET | `/api/events/:id` | Event details with ticket types |
| GET | `/api/venues` | List venues (filter: city, country, search) |
| GET | `/api/venues/:id` | Venue details with events |
| GET | `/api/accommodations` | List accommodations (filter: city, price range) |
| GET | `/api/accommodations/:id` | Accommodation details |
| POST | `/api/bookings/tickets` | Purchase event tickets |
| POST | `/api/bookings/accommodations` | Book accommodation |
| GET | `/api/bookings/:email` | Retrieve user bookings |

## Supported Markets

Europe and North America:
- Currencies: EUR, USD, GBP, CAD
- Cities: London, New York, Amsterdam, Paris, Toronto, Berlin
- Payments: Stripe (dominant processor in both regions)
