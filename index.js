require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB cluster clearly');
}).catch((err) => {
  console.error('Error connecting to MongoDB: ', err.message);
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
