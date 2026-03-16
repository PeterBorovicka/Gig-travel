# Gig Travel 🎵🌍

A full-stack web application for discovering live events, purchasing tickets, exploring venues, and booking accommodations worldwide — with integrated Stripe payments for Europe and North America.

## Features

- **🎫 Event Discovery & Tickets** — Browse concerts, festivals, and shows worldwide. Purchase tickets with multiple tiers (General Admission, VIP, Premium).
- **🎤 Venue Explorer** — Discover iconic venues across Europe and North America (O2 Arena, Madison Square Garden, Ziggo Dome, and more).
- **🏨 Accommodation Booking** — Find and book hotels near event venues with date selection and price calculation.
- **💳 Stripe Payment Integration** — Secure payments supporting Visa, Mastercard, Apple Pay, and Google Pay — the dominant payment methods in Europe and North America.
- **📋 Booking Management** — Look up and track all your ticket and accommodation bookings.
- **🔍 Search & Filtering** — Filter events by genre, city, and artist. Filter accommodations by city, country, and price range.
- **📱 Responsive Design** — Mobile-first, modern UI that works across all devices.

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
| GET | `/api/venues` | List venues (filter: city, country, search) |
| GET | `/api/venues/:id` | Venue details with events |
| GET | `/api/events` | List events (filter: genre, city, date, search) |
| GET | `/api/events/:id` | Event details with ticket types |
| GET | `/api/accommodations` | List accommodations (filter: city, price range) |
| GET | `/api/accommodations/:id` | Accommodation details |
| POST | `/api/bookings/tickets` | Purchase event tickets |
| POST | `/api/bookings/accommodations` | Book accommodation |
| GET | `/api/bookings/:email` | Retrieve user bookings |

## Supported Markets

The platform focuses on **Europe and North America** with:
- Multi-currency support (EUR, USD, GBP, CAD)
- Venues in London, New York, Amsterdam, Paris, Toronto, Berlin
- Stripe as primary payment processor (dominant in EU/NA markets)
