const express = require('express');
const router = express.Router();
const googleMapsService = require('../services/google-maps');

// Geocode address
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const location = await googleMapsService.geocodeAddress(address);
    res.json(location);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode address', details: error.message });
  }
});

// Get building insights
router.get('/building/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    
    const buildingData = await googleMapsService.getBuildingInsights(parseFloat(lat), parseFloat(lng));
    res.json(buildingData);
  } catch (error) {
    console.error('Building insights error:', error);
    res.status(500).json({ error: 'Failed to get building insights', details: error.message });
  }
});

module.exports = router;
