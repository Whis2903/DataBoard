const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');

// Load environment variables
dotenv.config();

// Import routes
const happinessRoutes = require('./routes/happiness');
const indicatorRoutes = require('./routes/indicators');
const classificationRoutes = require('./routes/classifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache with 30 minute TTL
const cache = new NodeCache({ stdTTL: 1800 });

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());

// Make cache available to routes
app.use((req, res, next) => {
  req.cache = cache;
  next();
});

// Routes
app.use('/api/happiness', happinessRoutes);
app.use('/api/indicator', indicatorRoutes);
app.use('/api/classifications', classificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cache_stats: req.cache.getStats()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Cache initialized with 30 minute TTL`);
});

module.exports = app;
