// api/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import your routes
const authRoutes = require('../backend/routes/auth');
const productRoutes = require('../backend/routes/products');
const orderRoutes = require('../backend/routes/orders');
const paymentRoutes = require('../backend/routes/payment');

const app = express();

// Middleware

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;