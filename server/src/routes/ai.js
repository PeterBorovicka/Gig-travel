const express = require('express');
const { getDb } = require('../models/database');

const router = express.Router();

// Lazily initialise OpenAI so the rest of the app works without the key
function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const OpenAI = require('openai');
  return new OpenAI({ apiKey: key });
}

function buildSystemPrompt(events, accommodations) {
  const eventList = events
    .map(
      (e) =>
        `- "${e.title}" by ${e.artist} (${e.genre}) at ${e.venue_name}, ${e.venue_city}` +
        ` on ${e.date} ${e.time}. Tickets from ${e.currency} ${Number(e.min_price).toFixed(2)}.`
    )
    .join('\n');

  const accommodationList = accommodations
    .map(
      (a) =>
        `- "${a.name}" in ${a.city}, ${a.country}` +
        ` — ${a.currency} ${Number(a.price_per_night).toFixed(2)}/night (Rating: ${a.rating}/5).`
    )
    .join('\n');

  return `You are an AI travel assistant for Gig Travel, a platform that helps music fans discover concerts and book nearby accommodation in one place. Be concise, friendly, and specific.

Upcoming events:
${eventList || 'No events currently available.'}

Available accommodations:
${accommodationList || 'No accommodations currently available.'}

Help users:
- Discover events that match their music tastes, location, or travel dates.
- Find suitable accommodation near event venues.
- Plan a complete gig trip (ticket + hotel bundle).
- Understand how to book on the Gig Travel platform.

Always reference real names, dates, and prices from the lists above. Never invent events or accommodations that are not listed. When relevant, suggest the user visit /events, /venues, /accommodations, or /bookings pages.`;
}

// GET /api/ai/status — check whether the AI assistant is configured
router.get('/status', (req, res) => {
  res.json({ available: !!process.env.OPENAI_API_KEY });
});

// POST /api/ai/chat — send a message to the AI travel assistant
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: 'message must be 1000 characters or fewer' });
  }

  const openai = getOpenAI();
  if (!openai) {
    return res
      .status(503)
      .json({ error: 'AI assistant is not configured. Please set the OPENAI_API_KEY environment variable.' });
  }

  const db = getDb();

  const events = db
    .prepare(
      `SELECT e.id, e.title, e.artist, e.genre, e.date, e.time,
              v.name AS venue_name, v.city AS venue_city,
              MIN(t.price) AS min_price, t.currency
       FROM events e
       JOIN venues v ON e.venue_id = v.id
       LEFT JOIN tickets t ON t.event_id = e.id
       GROUP BY e.id
       ORDER BY e.date ASC
       LIMIT 20`
    )
    .all();

  const accommodations = db
    .prepare(
      `SELECT id, name, city, country, price_per_night, currency, rating
       FROM accommodations
       ORDER BY city, price_per_night ASC
       LIMIT 20`
    )
    .all();

  const systemPrompt = buildSystemPrompt(events, accommodations);

  // Cap history at last 10 turns and sanitise roles to prevent prompt injection
  const recentHistory = history
    .filter(
      (m) =>
        m &&
        typeof m.role === 'string' &&
        typeof m.content === 'string' &&
        (m.role === 'user' || m.role === 'assistant')
    )
    .slice(-10)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: message.trim() },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'AI request failed', details: err.message });
  }
});

module.exports = router;
