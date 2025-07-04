const axios = require('axios');

class WorldBankService {
  constructor() {
    // Official World Bank API endpoints
    this.baseURL = 'https://api.worldbank.org/v2';
    this.countriesURL = `${this.baseURL}/country`;
    this.indicatorsURL = `${this.baseURL}/indicator`;
    
    // Request configuration
    this.requestConfig = {
      timeout: 15000,
      headers: {
        'User-Agent': 'Global-Happiness-Dashboard/1.0'
      }
    };
  }

  /**
   * Fetch World Bank indicator data for a specific country
   * @param {string} countryCode - ISO 3-letter country code
   * @param {string} indicator - World Bank indicator code
   * @param {number} startYear - Start year
   * @param {number} endYear - End year
   * @returns {Promise<Array>} Formatted data array
   */
  async getIndicatorData(countryCode, indicator, startYear, endYear) {
    try {
      console.log(`Fetching ${indicator} data for ${countryCode} (${startYear}-${endYear})`);
      
      const url = `${this.baseURL}/country/${countryCode}/indicator/${indicator}`;
      const params = {
        date: `${startYear}:${endYear}`,
        format: 'json',
        per_page: 1000,
        page: 1
      };

      const response = await axios.get(url, { 
        params, 
        ...this.requestConfig 
      });
      
      // World Bank API returns array where [0] is metadata, [1] is data
      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        throw new Error('Invalid response format from World Bank API');
      }
      
      const metadata = response.data[0];
      const data = response.data[1] || [];
      
      if (data.length === 0) {
        console.warn(`No data found for ${indicator} in ${countryCode}`);
        return [];
      }
      
      const formattedData = data
        .filter(item => item && item.value !== null && item.value !== undefined)
        .map(item => ({
          year: parseInt(item.date),
          value: parseFloat(item.value),
          country: item.country?.value || countryCode,
          countryCode: item.countryiso3code || countryCode,
          indicator: item.indicator?.value || indicator,
          indicatorCode: item.indicator?.id || indicator,
          unit: item.unit || '',
          obsStatus: item.obs_status || '',
          decimal: item.decimal || 0
        }))
        .sort((a, b) => a.year - b.year);

      console.log(`Retrieved ${formattedData.length} data points for ${indicator}`);
      return formattedData;
      
    } catch (error) {
      console.error(`Error fetching indicator data for ${countryCode}:`, error.message);
      
      // Provide more specific error information
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        throw new Error(`World Bank API error ${status}: ${statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - World Bank API is taking too long to respond');
      } else {
        throw new Error(`Failed to fetch indicator data: ${error.message}`);
      }
    }
  }

  /**
   * Get country classifications (regions and income groups) from World Bank
   * Uses official World Bank country classification data
   * @returns {Promise<Array>} Country classifications
   */
  async getCountryClassifications() {
    try {
      console.log('Fetching country classifications from World Bank...');
      
      const url = this.countriesURL;
      const params = {
        format: 'json',
        per_page: 500, // Increased to get all countries
        page: 1
      };

      const response = await axios.get(url, { 
        params, 
        ...this.requestConfig 
      });

      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        throw new Error('Invalid response format from World Bank countries API');
      }

      const countries = response.data[1] || [];
      
      const processedCountries = countries
        .filter(country => 
          country && 
          country.region?.value && 
          country.region.value !== 'Aggregates' &&
          country.id && 
          country.id.length === 3 // Only ISO3 codes
        )
        .map(country => ({
          code: country.id,
          name: country.name,
          region: country.region?.value || 'Unknown',
          regionCode: country.region?.id || '',
          incomeLevel: country.incomeLevel?.value || 'Unknown',
          incomeLevelCode: country.incomeLevel?.id || '',
          capitalCity: country.capitalCity || '',
          longitude: parseFloat(country.longitude) || null,
          latitude: parseFloat(country.latitude) || null,
          lendingType: country.lendingType?.value || ''
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(`Loaded ${processedCountries.length} country classifications`);
      return processedCountries;
      
    } catch (error) {
      console.error('Error fetching country classifications:', error.message);
      
      if (error.response) {
        throw new Error(`World Bank API error ${error.response.status}: ${error.response.statusText}`);
      } else {
        throw new Error(`Failed to fetch country classifications: ${error.message}`);
      }
    }
  }

  /**
   * Get list of available World Bank indicators with enhanced filtering
   * @param {string} topic - Optional topic filter
   * @param {number} limit - Maximum number of indicators to return
   * @returns {Promise<Array>} Available indicators
   */
  async getAvailableIndicators(topic = '', limit = 50) {
    try {
      console.log(`Fetching available indicators ${topic ? `for topic: ${topic}` : '(all topics)'}`);
      
      const url = this.indicatorsURL;
      const params = {
        format: 'json',
        per_page: Math.min(limit * 2, 1000), // Fetch more to filter later
        page: 1,
        ...(topic && { topic })
      };

      const response = await axios.get(url, { 
        params, 
        ...this.requestConfig 
      });

      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        throw new Error('Invalid response format from World Bank indicators API');
      }

      const indicators = response.data[1] || [];

      const processedIndicators = indicators
        .filter(indicator => 
          indicator && 
          indicator.name && 
          indicator.id &&
          indicator.name.length > 10 && // Filter out very short names
          !indicator.name.includes('(") &&') // Filter out malformed names
        )
        .map(indicator => ({
          id: indicator.id,
          name: indicator.name,
          unit: indicator.unit || '',
          source: indicator.source?.value || 'World Bank',
          sourceNote: indicator.sourceNote || '',
          topics: indicator.topics?.map(t => t.value) || [],
          sourceOrganization: indicator.sourceOrganization || ''
        }))
        .slice(0, limit);

      console.log(`Retrieved ${processedIndicators.length} indicators`);
      return processedIndicators;
      
    } catch (error) {
      console.error('Error fetching available indicators:', error.message);
      throw new Error(`Failed to fetch available indicators: ${error.message}`);
    }
  }

  /**
   * Get multiple countries data for comparison
   * @param {Array} countryCodes - Array of country codes
   * @param {string} indicator - Indicator code
   * @param {number} year - Specific year
   * @returns {Promise<Array>} Comparison data
   */
  async getMultiCountryData(countryCodes, indicator, year) {
    try {
      const promises = countryCodes.map(code => 
        this.getIndicatorData(code, indicator, year, year)
      );
      
      const results = await Promise.all(promises);
      
      return results
        .map((data, index) => ({
          countryCode: countryCodes[index],
          country: data[0]?.country || countryCodes[index],
          value: data[0]?.value || null,
          year: year
        }))
        .filter(item => item.value !== null);
    } catch (error) {
      console.error('Error fetching multi-country data:', error.message);
      throw new Error(`Failed to fetch multi-country data: ${error.message}`);
    }
  }
}

module.exports = new WorldBankService();
