const express = require('express');
const router = express.Router();
const happinessService = require('../services/happiness');

router.get('/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { start = 2015, end = 2023 } = req.query;
    
    const startYear = parseInt(start);
    const endYear = parseInt(end);
    
    if (isNaN(startYear) || isNaN(endYear)) {
      return res.status(400).json({ 
        error: 'Invalid year parameters. Please provide valid start and end years.' 
      });
    }

    const cacheKey = `happiness_${country}_${startYear}_${endYear}`;
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await happinessService.getHappinessData(
      country.toUpperCase(), 
      startYear, 
      endYear
    );
    
    if (data.length === 0) {
      return res.status(404).json({ 
        error: `No happiness data found for country ${country} between ${startYear} and ${endYear}` 
      });
    }

    req.cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in happiness route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch happiness data',
      message: error.message 
    });
  }
});

router.get('/global/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const yearInt = parseInt(year);
    
    if (isNaN(yearInt)) {
      return res.status(400).json({ 
        error: 'Invalid year parameter. Please provide a valid year.' 
      });
    }

    const cacheKey = `happiness_global_${yearInt}`;
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await happinessService.getGlobalHappinessData(yearInt);
    
    if (data.length === 0) {
      return res.status(404).json({ 
        error: `No global happiness data found for year ${yearInt}` 
      });
    }

    req.cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in global happiness route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch global happiness data',
      message: error.message 
    });
  }
});

router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    const cacheKey = `happiness_region_${region}`;
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await happinessService.getCountriesByRegion(region);
    
    if (data.length === 0) {
      return res.status(404).json({ 
        error: `No countries found for region ${region}` 
      });
    }

    req.cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in region happiness route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch region data',
      message: error.message 
    });
  }
});

router.get('/analysis/india', async (req, res) => {
  try {
    const cacheKey = 'happiness_analysis_india';
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await happinessService.getIndiaCorrelationAnalysis();
    
    req.cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in India analysis route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch India correlation analysis',
      message: error.message 
    });
  }
});

module.exports = router;
