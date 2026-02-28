const express = require('express');
const router = express.Router();
const roofDetectionService = require('../services/roofDetection');
const nrelService = require('../services/nrel');
const { calculateEnergyProduction } = require('../utils/energyCalculator');

// Detect roof surfaces from address
router.post('/detect-roof', async (req, res) => {
  try {
    const { address, lat, lng } = req.body;
    
    if (!address && (!lat || !lng)) {
      return res.status(400).json({ error: 'Address or coordinates required' });
    }

    const roofData = await roofDetectionService.detectRoof(address, lat, lng);
    res.json(roofData);
  } catch (error) {
    console.error('Roof detection error:', error);
    res.status(500).json({ error: 'Failed to detect roof surfaces', details: error.message });
  }
});

// Get solar irradiance data
router.post('/irradiance', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const irradianceData = await nrelService.getSolarIrradiance(lat, lng);
    res.json(irradianceData);
  } catch (error) {
    console.error('Irradiance data error:', error);
    res.status(500).json({ error: 'Failed to fetch solar irradiance data', details: error.message });
  }
});

// Calculate energy production
router.post('/calculate', async (req, res) => {
  try {
    const { panels, irradianceData, timeRange } = req.body;
    
    if (!panels || !irradianceData) {
      return res.status(400).json({ error: 'Panels and irradiance data required' });
    }

    const energyProduction = calculateEnergyProduction(panels, irradianceData, timeRange);
    res.json(energyProduction);
  } catch (error) {
    console.error('Energy calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate energy production', details: error.message });
  }
});

module.exports = router;
