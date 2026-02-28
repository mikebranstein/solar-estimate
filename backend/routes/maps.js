const express = require('express');
const router = express.Router();
const geocodingService = require('../services/google-maps');

// Geocode address using Nominatim (OpenStreetMap)
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const location = await geocodingService.geocodeAddress(address);
    res.json(location);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode address', details: error.message });
  }
});

module.exports = router;
