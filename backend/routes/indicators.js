const express = require('express');
const router = express.Router();
const worldBankService = require('../services/worldbank');

router.get('/:country/:indicator', async (req, res) => {
  try {
    const { country, indicator } = req.params;
    const { start = 2015, end = 2023 } = req.query;
    
    const startYear = parseInt(start);
    const endYear = parseInt(end);
    
    if (isNaN(startYear) || isNaN(endYear)) {
      return res.status(400).json({ 
        error: 'Invalid year parameters. Please provide valid start and end years.' 
      });
    }

    const cacheKey = `indicator_${country}_${indicator}_${startYear}_${endYear}`;
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await worldBankService.getIndicatorData(
      country.toUpperCase(), 
      indicator, 
      startYear, 
      endYear
    );
    
    if (data.length === 0) {
      return res.status(404).json({ 
        error: `No data found for indicator ${indicator} in country ${country} between ${startYear} and ${endYear}` 
      });
    }

    req.cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in indicator route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch indicator data',
      message: error.message 
    });
  }
});

router.post('/compare/:indicator/:year', async (req, res) => {
  try {
    const { indicator, year } = req.params;
    const { countries } = req.body;
    
    const yearInt = parseInt(year);
    
    if (isNaN(yearInt)) {
      return res.status(400).json({ 
        error: 'Invalid year parameter. Please provide a valid year.' 
      });
    }

    if (!countries || !Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({ 
        error: 'Please provide an array of country codes in the request body.' 
      });
    }

    const cacheKey = `indicator_compare_${indicator}_${yearInt}_${countries.sort().join('_')}`;
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await worldBankService.getMultiCountryData(
      countries.map(c => c.toUpperCase()), 
      indicator, 
      yearInt
    );
    
    if (data.length === 0) {
      return res.status(404).json({ 
        error: `No data found for indicator ${indicator} in year ${yearInt}` 
      });
    }

    req.cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in indicator comparison route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch indicator comparison data',
      message: error.message 
    });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { topic } = req.query;
    
    const cacheKey = `indicators_list_${topic || 'all'}`;
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const data = await worldBankService.getAvailableIndicators(topic);
    
    req.cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in indicators list route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch indicators list',
      message: error.message 
    });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const cacheKey = 'indicators_popular';
    const cachedData = req.cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const popularIndicators = [
      {
        id: 'NY.GDP.MKTP.CD',
        name: 'GDP (current US$)',
        category: 'Economic'
      },
      {
        id: 'NY.GDP.PCAP.CD',
        name: 'GDP per capita (current US$)',
        category: 'Economic'
      },
      {
        id: 'SP.DYN.LE00.IN',
        name: 'Life expectancy at birth, total (years)',
        category: 'Health'
      },
      {
        id: 'SE.ADT.LITR.ZS',
        name: 'Literacy rate, adult total (% of people ages 15 and above)',
        category: 'Education'
      },
      {
        id: 'SI.POV.GINI',
        name: 'Gini index',
        category: 'Social'
      },
      {
        id: 'EN.ATM.CO2E.PC',
        name: 'CO2 emissions (metric tons per capita)',
        category: 'Environment'
      },
      {
        id: 'SP.POP.TOTL',
        name: 'Population, total',
        category: 'Demographics'
      },
      {
        id: 'SH.XPD.CHEX.GD.ZS',
        name: 'Current health expenditure (% of GDP)',
        category: 'Health'
      },
      {
        id: 'SE.XPD.TOTL.GD.ZS',
        name: 'Government expenditure on education, total (% of GDP)',
        category: 'Education'
      },
      {
        id: 'SL.UEM.TOTL.ZS',
        name: 'Unemployment, total (% of total labor force)',
        category: 'Economic'
      }
    ];

    req.cache.set(cacheKey, popularIndicators, 86400); 
    
    res.json({
      data: popularIndicators,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in popular indicators route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch popular indicators',
      message: error.message 
    });
  }
});

module.exports = router;
