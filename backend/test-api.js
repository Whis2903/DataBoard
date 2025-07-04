const worldBankService = require('./services/worldbank');
const happinessService = require('./services/happiness');

/**
 * Test script to verify API functionality
 */
async function testAPIs() {
  console.log('🧪 Starting API functionality tests...\n');

  try {
    // Test 1: World Bank Country Classifications
    console.log('📍 Test 1: Fetching country classifications...');
    const countries = await worldBankService.getCountryClassifications();
    console.log(`✅ Success: Retrieved ${countries.length} countries`);
    console.log('Sample countries:', countries.slice(0, 3).map(c => `${c.name} (${c.code}) - ${c.region}`));
    console.log('');

    // Test 2: World Bank Indicator Data
    console.log('📊 Test 2: Fetching GDP data for India...');
    const gdpData = await worldBankService.getIndicatorData('IND', 'NY.GDP.MKTP.CD', 2020, 2022);
    console.log(`✅ Success: Retrieved ${gdpData.length} GDP data points for India`);
    if (gdpData.length > 0) {
      console.log('Sample data:', gdpData[0]);
    }
    console.log('');

    // Test 3: Available Indicators
    console.log('📋 Test 3: Fetching available indicators...');
    const indicators = await worldBankService.getAvailableIndicators('', 10);
    console.log(`✅ Success: Retrieved ${indicators.length} indicators`);
    console.log('Sample indicators:', indicators.slice(0, 3).map(i => `${i.name} (${i.id})`));
    console.log('');

    // Test 4: Happiness Data
    console.log('😊 Test 4: Fetching happiness data...');
    const happinessData = await happinessService.getHappinessData('IND', 2020, 2022);
    console.log(`✅ Success: Retrieved ${happinessData.length} happiness data points`);
    if (happinessData.length > 0) {
      console.log('Sample happiness data:', happinessData[0]);
    }
    console.log('');

    // Test 5: Global Happiness Data
    console.log('🌍 Test 5: Fetching global happiness data for 2022...');
    const globalHappiness = await happinessService.getGlobalHappinessData(2022);
    console.log(`✅ Success: Retrieved ${globalHappiness.length} countries' happiness data`);
    console.log('Top 3 happiest countries:', globalHappiness.slice(0, 3).map(c => `${c.country}: ${c.happinessScore}`));
    console.log('');

    // Test 6: India Correlation Analysis
    console.log('🇮🇳 Test 6: India correlation analysis...');
    const indiaAnalysis = await happinessService.getIndiaCorrelationAnalysis();
    console.log('✅ Success: Generated India correlation analysis');
    console.log('Top correlations:', indiaAnalysis.correlations.slice(0, 3));
    console.log('');

    console.log('🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAPIs();
}

module.exports = { testAPIs };
