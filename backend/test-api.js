const worldBankService = require('./services/worldbank');
const happinessService = require('./services/happiness');

const TIMEOUT = 30000; // 30 seconds timeout for each test

function timeoutPromise(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout')), ms)
    )
  ]);
}

async function runTest(testName, testFunction) {
  console.log(`📍 ${testName}...`);
  const startTime = Date.now();
  
  try {
    const result = await timeoutPromise(testFunction(), TIMEOUT);
    const duration = Date.now() - startTime;
    console.log(`✅ Success (${duration}ms): ${result}`);
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Failed (${duration}ms): ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`   Stack: ${error.stack}`);
    }
    return false;
  }
}

async function testAPIs() {
  console.log('🧪 Starting comprehensive API functionality tests...\n');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);

  const testStartTime = Date.now();
  const results = [];

  // Test 1: Country Classifications
  results.push(await runTest(
    'Test 1: Fetching country classifications',
    async () => {
      const countries = await worldBankService.getCountryClassifications();
      const sampleCountries = countries.slice(0, 3).map(c => `${c.name} (${c.code}) - ${c.region}`);
      return `Retrieved ${countries.length} countries. Sample: ${sampleCountries.join(', ')}`;
    }
  ));

  // Test 2: GDP Data for India
  results.push(await runTest(
    'Test 2: Fetching GDP data for India (2020-2022)',
    async () => {
      const gdpData = await worldBankService.getIndicatorData('IND', 'NY.GDP.MKTP.CD', 2020, 2022);
      const sample = gdpData.length > 0 ? `${gdpData[0].year}: $${(gdpData[0].value / 1e12).toFixed(2)}T` : 'No data';
      return `Retrieved ${gdpData.length} GDP data points. Sample: ${sample}`;
    }
  ));

  // Test 3: Available Indicators
  results.push(await runTest(
    'Test 3: Fetching available indicators',
    async () => {
      const indicators = await worldBankService.getAvailableIndicators('', 10);
      const sampleIndicators = indicators.slice(0, 2).map(i => i.name).join(', ');
      return `Retrieved ${indicators.length} indicators. Sample: ${sampleIndicators}`;
    }
  ));

  // Test 4: Happiness Data for India
  results.push(await runTest(
    'Test 4: Fetching happiness data for India',
    async () => {
      const happinessData = await happinessService.getHappinessData('IND', 2020, 2022);
      const sample = happinessData.length > 0 ? `${happinessData[0].year}: ${happinessData[0].happinessScore}` : 'No data';
      return `Retrieved ${happinessData.length} happiness data points. Sample: ${sample}`;
    }
  ));

  // Test 5: Global Happiness Data
  results.push(await runTest(
    'Test 5: Fetching global happiness data for 2022',
    async () => {
      const globalHappiness = await happinessService.getGlobalHappinessData(2022);
      const top3 = globalHappiness.slice(0, 3).map(c => `${c.country}: ${c.happinessScore}`).join(', ');
      return `Retrieved ${globalHappiness.length} countries. Top 3: ${top3}`;
    }
  ));

  // Test 6: India Correlation Analysis
  results.push(await runTest(
    'Test 6: India correlation analysis',
    async () => {
      const indiaAnalysis = await happinessService.getIndiaCorrelationAnalysis();
      const topCorr = indiaAnalysis.correlations.slice(0, 2).map(c => `${c.factorCode}: ${c.correlation.toFixed(3)}`).join(', ');
      return `Generated analysis with ${indiaAnalysis.correlations.length} correlations. Top: ${topCorr}`;
    }
  ));

  // Test Summary
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All API tests completed successfully!');
    console.log('✨ Backend is ready for production deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('🔧 Fix the issues before deploying to production.');
  }
  
  console.log(`\n⏱️  Total test duration: ${Date.now() - testStartTime}ms`);
  
  // Exit with appropriate code
  process.exit(passed === total ? 0 : 1);
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
testAPIs().catch(error => {
  console.error('❌ Fatal error during testing:', error);
  process.exit(1);
});
