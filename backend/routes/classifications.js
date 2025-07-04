const express = require('express');
const router = express.Router();
const worldBankService = require('../services/worldbank');

/**
 * GET /api/classifications
 * Get country classifications by region and income group
 */
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'country_classifications';
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await worldBankService.getCountryClassifications();
    
    // Group by regions and income levels for easier frontend consumption
    const regions = {};
    const incomeLevels = {};
    
    data.forEach(country => {
      // Group by region
      if (!regions[country.region]) {
        regions[country.region] = [];
      }
      regions[country.region].push(country);
      
      // Group by income level
      if (!incomeLevels[country.incomeLevel]) {
        incomeLevels[country.incomeLevel] = [];
      }
      incomeLevels[country.incomeLevel].push(country);
    });

    const result = {
      countries: data,
      regions: Object.keys(regions).map(region => ({
        name: region,
        countries: regions[region],
        count: regions[region].length
      })),
      incomeLevels: Object.keys(incomeLevels).map(level => ({
        name: level,
        countries: incomeLevels[level],
        count: incomeLevels[level].length
      }))
    };

    req.cache.set(cacheKey, result, 86400); // Cache for 24 hours
    
    res.json({
      data: result,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in classifications route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch country classifications',
      message: error.message 
    });
  }
});

/**
 * GET /api/classifications/regions
 * Get list of available regions
 */
router.get('/regions', async (req, res) => {
  try {
    const cacheKey = 'regions_list';
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const classifications = await worldBankService.getCountryClassifications();
    const regions = [...new Set(classifications.map(c => c.region))].sort();
    
    req.cache.set(cacheKey, regions, 86400);
    
    res.json({
      data: regions,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in regions route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch regions list',
      message: error.message 
    });
  }
});

/**
 * GET /api/classifications/countries/:region
 * Get countries in a specific region
 */
router.get('/countries/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    const cacheKey = `region_countries_${region}`;
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const classifications = await worldBankService.getCountryClassifications();
    const regionCountries = classifications.filter(c => 
      c.region.toLowerCase() === region.toLowerCase()
    );
    
    if (regionCountries.length === 0) {
      return res.status(404).json({ 
        error: `No countries found for region: ${region}` 
      });
    }

    req.cache.set(cacheKey, regionCountries, 86400);
    
    res.json({
      data: regionCountries,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in region countries route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch countries for region',
      message: error.message 
    });
  }
});

module.exports = router;
