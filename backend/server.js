require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const solarRoutes = require('./routes/solar');
const mapsRoutes = require('./routes/maps');

app.use('/api/solar', solarRoutes);
app.use('/api/maps', mapsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Solar Estimate API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
