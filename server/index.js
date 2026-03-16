require('dotenv').config();
const { createApp } = require('./src/app');
const { seedDb } = require('./src/models/database');

const PORT = process.env.PORT || 3001;

// Seed database with sample data
seedDb();

const app = createApp();

app.listen(PORT, () => {
  console.log(`Gig Travel API server running on http://localhost:${PORT}`);
});
