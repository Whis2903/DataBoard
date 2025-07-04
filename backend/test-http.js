const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

/**
 * Test HTTP endpoints
 */
async function testHTTPEndpoints() {
  console.log('🌐 Testing HTTP API endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('❤️ Test 1: Health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Server Status: ${health.data.status}`);
    console.log('Cache Stats:', health.data.cache_stats);
    console.log('');

    // Test 2: Country Classifications
    console.log('📍 Test 2: Country classifications...');
    const classifications = await axios.get(`${BASE_URL}/classifications`);
    console.log(`✅ Retrieved ${classifications.data.data.length} countries`);
    console.log(`Cache status: ${classifications.data.cached ? 'HIT' : 'MISS'}`);
    console.log('');

    // Test 3: Regions Summary
    console.log('🌍 Test 3: Regions summary...');
    const regions = await axios.get(`${BASE_URL}/classifications/regions`);
    console.log(`✅ Retrieved ${regions.data.data.length} regions`);
    console.log('Top regions:', regions.data.data.slice(0, 3).map(r => `${r.region} (${r.countryCount} countries)`));
    console.log('');

    // Test 4: Happiness data for India
    console.log('😊 Test 4: Happiness data for India (2020-2022)...');
    const happiness = await axios.get(`${BASE_URL}/happiness/IND?start=2020&end=2022`);
    console.log(`✅ Retrieved ${happiness.data.data.length} happiness records`);
    if (happiness.data.data.length > 0) {
      console.log('Sample:', happiness.data.data[0]);
    }
    console.log('');

    // Test 5: World Bank Indicator (GDP for India)
    console.log('📊 Test 5: GDP data for India...');
    const gdp = await axios.get(`${BASE_URL}/indicator/IND/NY.GDP.MKTP.CD?start=2020&end=2022`);
    console.log(`✅ Retrieved ${gdp.data.data.length} GDP records`);
    if (gdp.data.data.length > 0) {
      console.log('Sample GDP data:', gdp.data.data[0]);
    }
    console.log('');

    // Test 6: Popular Indicators
    console.log('📋 Test 6: Popular indicators...');
    const indicators = await axios.get(`${BASE_URL}/indicator/popular`);
    console.log(`✅ Retrieved ${indicators.data.data.length} popular indicators`);
    console.log('Sample indicators:', indicators.data.data.slice(0, 3).map(i => i.name));
    console.log('');

    // Test 7: Global Happiness for 2022
    console.log('🌍 Test 7: Global happiness data for 2022...');
    const globalHappiness = await axios.get(`${BASE_URL}/happiness/global/2022`);
    console.log(`✅ Retrieved ${globalHappiness.data.data.length} countries`);
    console.log('Top 3 happiest:', globalHappiness.data.data.slice(0, 3).map(c => `${c.country}: ${c.happinessScore}`));
    console.log('');

    // Test 8: India Correlation Analysis
    console.log('🇮🇳 Test 8: India correlation analysis...');
    const indiaAnalysis = await axios.get(`${BASE_URL}/happiness/analysis/india`);
    console.log('✅ India analysis completed');
    console.log('Top correlations:', indiaAnalysis.data.data.correlations.slice(0, 3));
    console.log('');

    console.log('🎉 All HTTP endpoint tests completed successfully!');

  } catch (error) {
    console.error('❌ HTTP Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
testHTTPEndpoints();
