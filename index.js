require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;
let isDbConnected = false;

async function connectDb() {
  if (isDbConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Set it in environment variables.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  isDbConnected = true;
}

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Ensure DB is connected before handling API routes.
app.use(async (_req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('3D Portfolio API is running');
});

// Use routes
app.use('/api/career', require('./routes/careerRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));
app.use('/api/landing', require('./routes/landingRoutes'));
app.use('/api/whatido', require('./routes/whatidoRoutes'));
app.use('/api/techstack', require('./routes/techstackRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Start local server only when not running on Vercel serverless runtime.
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    try {
      await connectDb();
      console.log('Connected to MongoDB cluster clearly');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err.message);
    }
    console.log(`Server is listening on port ${PORT}`);
  });
}

module.exports = app;
