const axios = require('axios');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class HappinessService {
  constructor() {
    // Path to the official World Happiness Report Excel file
    this.excelFilePath = path.join(__dirname, '..', 'Happiness_index.xlsx');
    this.happinessData = null;
    this.lastFetch = null;
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Load happiness data from the official Excel file
   * @returns {Promise<Array>} Processed happiness data
   */
  async loadHappinessData() {
    if (this.happinessData && this.lastFetch && 
        (Date.now() - this.lastFetch) < this.cacheDuration) {
      return this.happinessData;
    }

    try {
      console.log('Loading happiness data from official Excel file...');
      
      // Check if the Excel file exists
      if (!fs.existsSync(this.excelFilePath)) {
        throw new Error(`Excel file not found at ${this.excelFilePath}`);
      }
      
      // Read the Excel file
      const workbook = XLSX.readFile(this.excelFilePath);
      const worksheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`Read ${rawData.length} rows from Excel file`);
      console.log('Sample row:', rawData[0]);
      
      this.happinessData = this.processExcelHappinessData(rawData);
      this.lastFetch = Date.now();
      
      console.log(`Processed ${this.happinessData.length} happiness records`);
      return this.happinessData;
    } catch (error) {
      console.error('Error loading happiness data from Excel:', error.message);
      // Fallback to sample data if Excel loading fails
      console.log('Using fallback sample data...');
      const sampleData = await this.generateSampleHappinessData();
      this.happinessData = this.processHappinessData(sampleData);
      this.lastFetch = Date.now();
      return this.happinessData;
    }
  }

  /**
   * Fetch data from the official World Happiness Report API
   * @returns {Promise<Array>} Raw happiness data
   */
  async fetchFromOfficialAPI() {
    try {
      // The World Happiness Report site uses GraphQL/REST API
      // We'll try to get the data structure they use
      const response = await axios.get(this.worldHappinessAPI, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // If the response is HTML, we need to extract the data differently
      if (response.headers['content-type']?.includes('text/html')) {
        throw new Error('Received HTML instead of JSON data');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch from official API: ${error.message}`);
    }
  }

  /**
   * Fetch data from CSV source as fallback
   * @returns {Promise<Array>} Parsed CSV data
   */
  async fetchFromCSVSource() {
    try {
      const response = await axios.get(this.happinessDataCSV, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return this.parseCSVData(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch CSV data: ${error.message}`);
    }
  }

  /**
   * Parse CSV data into structured format
   * @param {string} csvData - Raw CSV string
   * @returns {Array} Parsed data array
   */
  parseCSVData(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.replace(/"/g, '').trim();
          });
          data.push(row);
        }
      }
    }

    return data;
  }

  /**
   * Parse a CSV line handling quoted values
   * @param {string} line - CSV line
   * @returns {Array} Parsed values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  /**
   * Generate sample happiness data for demonstration
   * In production, this would fetch from actual World Happiness Report
   */
  async generateSampleHappinessData() {
    // Sample data based on World Happiness Report structure
    const countries = [
      { code: 'DNK', name: 'Denmark', region: 'Western Europe' },
      { code: 'CHE', name: 'Switzerland', region: 'Western Europe' },
      { code: 'ISL', name: 'Iceland', region: 'Western Europe' },
      { code: 'NOR', name: 'Norway', region: 'Western Europe' },
      { code: 'NLD', name: 'Netherlands', region: 'Western Europe' },
      { code: 'SWE', name: 'Sweden', region: 'Western Europe' },
      { code: 'USA', name: 'United States', region: 'North America' },
      { code: 'GBR', name: 'United Kingdom', region: 'Western Europe' },
      { code: 'DEU', name: 'Germany', region: 'Western Europe' },
      { code: 'CAN', name: 'Canada', region: 'North America' },
      { code: 'IND', name: 'India', region: 'South Asia' },
      { code: 'CHN', name: 'China', region: 'East Asia' },
      { code: 'JPN', name: 'Japan', region: 'East Asia' },
      { code: 'BRA', name: 'Brazil', region: 'Latin America' },
      { code: 'ZAF', name: 'South Africa', region: 'Sub-Saharan Africa' }
    ];

    const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
    const data = [];

    countries.forEach(country => {
      years.forEach(year => {
        // Generate realistic happiness scores with some variation
        let baseScore;
        switch (country.region) {
          case 'Western Europe':
            baseScore = 7.0 + Math.random() * 0.8;
            break;
          case 'North America':
            baseScore = 6.8 + Math.random() * 0.6;
            break;
          case 'East Asia':
            baseScore = 5.8 + Math.random() * 0.8;
            break;
          case 'South Asia':
            baseScore = 4.2 + Math.random() * 0.8;
            break;
          case 'Latin America':
            baseScore = 5.5 + Math.random() * 1.0;
            break;
          default:
            baseScore = 4.5 + Math.random() * 1.5;
        }

        // Add year-based variation (slight decline during COVID)
        if (year === 2020 || year === 2021) {
          baseScore -= 0.1 + Math.random() * 0.2;
        }

        data.push({
          country: country.name,
          countryCode: country.code,
          region: country.region,
          year: year,
          happinessScore: Math.round(baseScore * 100) / 100,
          gdpPerCapita: 8 + Math.random() * 4, // Log GDP per capita
          socialSupport: 0.7 + Math.random() * 0.3,
          healthyLifeExpectancy: 60 + Math.random() * 20,
          freedomToMakeLifeChoices: 0.6 + Math.random() * 0.4,
          generosity: -0.1 + Math.random() * 0.3,
          perceptionsOfCorruption: 0.1 + Math.random() * 0.4
        });
      });
    });

    return data;
  }

  /**
   * Process and clean happiness data from various sources
   * @param {Array} rawData - Raw happiness data
   * @returns {Array} Processed data
   */
  processHappinessData(rawData) {
    return rawData.map(item => {
      // Handle different data source formats
      const countryCode = item.countryCode || item.iso3 || item.ISO3 || item.Code || '';
      const country = item.country || item.Country || item.Entity || '';
      const year = parseInt(item.year || item.Year || new Date().getFullYear());
      
      return {
        country: country,
        countryCode: countryCode.toUpperCase(),
        region: item.region || item.Region || this.getRegionByCountry(countryCode) || 'Unknown',
        year: year,
        happinessScore: parseFloat(item.happinessScore || item['Life satisfaction'] || item['Happiness Score'] || item.score) || 0,
        gdpPerCapita: parseFloat(item.gdpPerCapita || item['GDP per capita'] || item['Log GDP per capita']) || 0,
        socialSupport: parseFloat(item.socialSupport || item['Social support'] || item['Family']) || 0,
        healthyLifeExpectancy: parseFloat(item.healthyLifeExpectancy || item['Healthy life expectancy'] || item['Health']) || 0,
        freedomToMakeLifeChoices: parseFloat(item.freedomToMakeLifeChoices || item['Freedom to make life choices'] || item['Freedom']) || 0,
        generosity: parseFloat(item.generosity || item['Generosity']) || 0,
        perceptionsOfCorruption: parseFloat(item.perceptionsOfCorruption || item['Perceptions of corruption'] || item['Trust']) || 0
      };
    }).filter(item => item.country && item.happinessScore > 0);
  }

  /**
   * Process Excel happiness data from the official World Happiness Report
   * @param {Array} rawData - Raw data from Excel file
   * @returns {Array} Processed data array
   */
  processExcelHappinessData(rawData) {
    console.log('Processing Excel data. Column names:', Object.keys(rawData[0] || {}));
    
    return rawData
      .filter(row => row && Object.keys(row).length > 0)
      .map(row => {
        // Map Excel columns to our data structure
        // The Excel file from World Happiness Report typically has these columns:
        // Looking at the sample: Year, Rank, Country name, Ladder score, etc.
        
        const countryName = row['Country name'] || row['Country'] || row['country'] || '';
        const year = parseInt(row['Year'] || row['year'] || 2024);
        const happinessScore = parseFloat(row['Ladder score'] || row['Life Ladder'] || row['Happiness Score'] || row['happiness'] || 0);
        
        // Extract other happiness factors from the "Explained by:" columns
        const gdpPerCapita = parseFloat(row['Explained by: Log GDP per capita'] || row['Log GDP per capita'] || row['GDP per capita'] || 0);
        const socialSupport = parseFloat(row['Explained by: Social support'] || row['Social support'] || row['Family'] || 0);
        const healthyLifeExpectancy = parseFloat(row['Explained by: Healthy life expectancy'] || row['Healthy life expectancy at birth'] || row['Health'] || 0);
        const freedom = parseFloat(row['Explained by: Freedom to make life choices'] || row['Freedom to make life choices'] || row['Freedom'] || 0);
        const generosity = parseFloat(row['Explained by: Generosity'] || row['Generosity'] || 0);
        const corruption = parseFloat(row['Explained by: Perceptions of corruption'] || row['Perceptions of corruption'] || row['Corruption'] || 0);
        
        // Get country code and region
        const countryCode = this.getCountryCode(countryName);
        const region = this.getRegionByCountry(countryCode) || this.getRegionByCountryName(countryName);
        
        return {
          country: countryName,
          countryCode: countryCode,
          region: region,
          year: year,
          happinessScore: happinessScore,
          gdpPerCapita: gdpPerCapita,
          socialSupport: socialSupport,
          healthyLifeExpectancy: healthyLifeExpectancy,
          freedomToMakeLifeChoices: freedom,
          generosity: generosity,
          perceptionsOfCorruption: corruption
        };
      })
      .filter(item => item.country && item.happinessScore > 0) // Filter out invalid entries
      .sort((a, b) => b.year - a.year || b.happinessScore - a.happinessScore); // Sort by year desc, then happiness desc
  }

  /**
   * Get country code from country name
   * @param {string} countryName - Full country name
   * @returns {string} ISO3 country code
   */
  getCountryCode(countryName) {
    const countryMap = {
      'Denmark': 'DNK', 'Switzerland': 'CHE', 'Iceland': 'ISL', 'Norway': 'NOR', 
      'Netherlands': 'NLD', 'Sweden': 'SWE', 'United States': 'USA', 'United Kingdom': 'GBR',
      'Germany': 'DEU', 'Canada': 'CAN', 'India': 'IND', 'China': 'CHN', 'Japan': 'JPN',
      'Brazil': 'BRA', 'South Africa': 'ZAF', 'Australia': 'AUS', 'France': 'FRA',
      'Italy': 'ITA', 'Spain': 'ESP', 'Portugal': 'PRT', 'Finland': 'FIN', 'Austria': 'AUT',
      'Belgium': 'BEL', 'Ireland': 'IRL', 'Luxembourg': 'LUX', 'New Zealand': 'NZL',
      'Israel': 'ISR', 'South Korea': 'KOR', 'Singapore': 'SGP', 'Mexico': 'MEX',
      'Argentina': 'ARG', 'Chile': 'CHL', 'Colombia': 'COL', 'Peru': 'PER', 'Russia': 'RUS',
      'Poland': 'POL', 'Czech Republic': 'CZE', 'Hungary': 'HUN', 'Slovakia': 'SVK',
      'Slovenia': 'SVN', 'Estonia': 'EST', 'Latvia': 'LVA', 'Lithuania': 'LTU',
      'Croatia': 'HRV', 'Greece': 'GRC', 'Turkey': 'TUR', 'Thailand': 'THA',
      'Malaysia': 'MYS', 'Indonesia': 'IDN', 'Philippines': 'PHL', 'Vietnam': 'VNM',
      'Pakistan': 'PAK', 'Bangladesh': 'BGD', 'Sri Lanka': 'LKA', 'Egypt': 'EGY',
      'Nigeria': 'NGA', 'Ghana': 'GHA', 'Kenya': 'KEN', 'Ethiopia': 'ETH',
      'Morocco': 'MAR', 'Algeria': 'DZA', 'Tunisia': 'TUN', 'Costa Rica': 'CRI',
      'Uruguay': 'URY', 'Panama': 'PAN', 'Guatemala': 'GTM', 'Nicaragua': 'NIC',
      'Honduras': 'HND', 'El Salvador': 'SLV', 'Dominican Republic': 'DOM',
      'Jamaica': 'JAM', 'Trinidad and Tobago': 'TTO', 'Ecuador': 'ECU', 'Bolivia': 'BOL',
      'Paraguay': 'PRY', 'Venezuela': 'VEN', 'Guyana': 'GUY', 'Suriname': 'SUR',
      'Cyprus': 'CYP', 'Malta': 'MLT', 'Romania': 'ROU', 'Bulgaria': 'BGR',
      'Serbia': 'SRB', 'Montenegro': 'MNE', 'Bosnia and Herzegovina': 'BIH',
      'North Macedonia': 'MKD', 'Albania': 'ALB', 'Moldova': 'MDA', 'Ukraine': 'UKR',
      'Belarus': 'BLR', 'Georgia': 'GEO', 'Armenia': 'ARM', 'Azerbaijan': 'AZE',
      'Kazakhstan': 'KAZ', 'Uzbekistan': 'UZB', 'Turkmenistan': 'TKM',
      'Kyrgyzstan': 'KGZ', 'Tajikistan': 'TJK', 'Mongolia': 'MNG', 'Nepal': 'NPL',
      'Bhutan': 'BTN', 'Maldives': 'MDV', 'Myanmar': 'MMR', 'Cambodia': 'KHM',
      'Laos': 'LAO', 'Afghanistan': 'AFG', 'Iran': 'IRN', 'Iraq': 'IRQ',
      'Saudi Arabia': 'SAU', 'United Arab Emirates': 'ARE', 'Kuwait': 'KWT',
      'Qatar': 'QAT', 'Bahrain': 'BHR', 'Oman': 'OMN', 'Yemen': 'YEM',
      'Jordan': 'JOR', 'Lebanon': 'LBN', 'Syria': 'SYR', 'Libya': 'LBY',
      'Sudan': 'SDN', 'South Sudan': 'SSD', 'Chad': 'TCD', 'Niger': 'NER',
      'Mali': 'MLI', 'Burkina Faso': 'BFA', 'Senegal': 'SEN', 'Gambia': 'GMB',
      'Guinea-Bissau': 'GNB', 'Guinea': 'GIN', 'Sierra Leone': 'SLE',
      'Liberia': 'LBR', 'Ivory Coast': 'CIV', 'Togo': 'TGO', 'Benin': 'BEN',
      'Mauritania': 'MRT', 'Cape Verde': 'CPV', 'Sao Tome and Principe': 'STP',
      'Equatorial Guinea': 'GNQ', 'Gabon': 'GAB', 'Congo': 'COG',
      'Democratic Republic of Congo': 'COD', 'Central African Republic': 'CAF',
      'Cameroon': 'CMR', 'Chad': 'TCD', 'Angola': 'AGO', 'Zambia': 'ZMB',
      'Zimbabwe': 'ZWE', 'Botswana': 'BWA', 'Namibia': 'NAM', 'Lesotho': 'LSO',
      'Swaziland': 'SWZ', 'Madagascar': 'MDG', 'Mauritius': 'MUS',
      'Comoros': 'COM', 'Seychelles': 'SYC', 'Djibouti': 'DJI', 'Eritrea': 'ERI',
      'Somalia': 'SOM', 'Uganda': 'UGA', 'Tanzania': 'TZA', 'Rwanda': 'RWA',
      'Burundi': 'BDI', 'Malawi': 'MWI', 'Mozambique': 'MOZ', 'Fiji': 'FJI',
      'Papua New Guinea': 'PNG', 'Solomon Islands': 'SLB', 'Vanuatu': 'VUT',
      'Samoa': 'WSM', 'Tonga': 'TON', 'Kiribati': 'KIR', 'Tuvalu': 'TUV',
      'Nauru': 'NRU', 'Palau': 'PLW', 'Marshall Islands': 'MHL',
      'Micronesia': 'FSM'
    };
    
    return countryMap[countryName] || countryName.substring(0, 3).toUpperCase();
  }

  /**
   * Get region by country name for countries not in the code map
   * @param {string} countryName - Full country name
   * @returns {string} Region name
   */
  getRegionByCountryName(countryName) {
    const regionMap = {
      // Western Europe
      'Denmark': 'Western Europe',
      'Switzerland': 'Western Europe',
      'Iceland': 'Western Europe',
      'Norway': 'Western Europe',
      'Netherlands': 'Western Europe',
      'Sweden': 'Western Europe',
      'United Kingdom': 'Western Europe',
      'Germany': 'Western Europe',
      'France': 'Western Europe',
      'Italy': 'Western Europe',
      'Spain': 'Western Europe',
      'Portugal': 'Western Europe',
      'Finland': 'Western Europe',
      'Austria': 'Western Europe',
      'Belgium': 'Western Europe',
      'Ireland': 'Western Europe',
      'Luxembourg': 'Western Europe',
      
      // North America
      'United States': 'North America',
      'Canada': 'North America',
      
      // East Asia
      'China': 'East Asia',
      'Japan': 'East Asia',
      'South Korea': 'East Asia',
      'Singapore': 'East Asia',
      
      // South Asia
      'India': 'South Asia',
      'Pakistan': 'South Asia',
      'Bangladesh': 'South Asia',
      'Sri Lanka': 'South Asia',
      
      // Latin America
      'Brazil': 'Latin America and Caribbean',
      'Mexico': 'Latin America and Caribbean',
      'Argentina': 'Latin America and Caribbean',
      'Chile': 'Latin America and Caribbean',
      'Colombia': 'Latin America and Caribbean',
      'Peru': 'Latin America and Caribbean',
      
      // Sub-Saharan Africa
      'South Africa': 'Sub-Saharan Africa',
      'Nigeria': 'Sub-Saharan Africa',
      'Ghana': 'Sub-Saharan Africa',
      'Kenya': 'Sub-Saharan Africa',
      'Ethiopia': 'Sub-Saharan Africa',
      
      // Middle East and North Africa
      'Egypt': 'Middle East and North Africa',
      'Morocco': 'Middle East and North Africa',
      'Algeria': 'Middle East and North Africa',
      'Tunisia': 'Middle East and North Africa',
      'Turkey': 'Middle East and North Africa',
      'Israel': 'Middle East and North Africa',
      
      // Southeast Asia
      'Thailand': 'Southeast Asia',
      'Malaysia': 'Southeast Asia',
      'Indonesia': 'Southeast Asia',
      'Philippines': 'Southeast Asia',
      'Vietnam': 'Southeast Asia',
      
      // Commonwealth of Independent States
      'Russia': 'Commonwealth of Independent States',
      
      // Central and Eastern Europe
      'Poland': 'Central and Eastern Europe',
      'Czech Republic': 'Central and Eastern Europe',
      'Hungary': 'Central and Eastern Europe',
      'Slovakia': 'Central and Eastern Europe',
      'Slovenia': 'Central and Eastern Europe',
      'Estonia': 'Central and Eastern Europe',
      'Latvia': 'Central and Eastern Europe',
      'Lithuania': 'Central and Eastern Europe',
      'Croatia': 'Central and Eastern Europe',
      'Greece': 'Central and Eastern Europe'
    };
    
    return regionMap[countryName] || 'Other';
  }

  /**
   * Get region by country code
   * @param {string} countryCode - ISO3 country code
   * @returns {string} Region name
   */
  getRegionByCountry(countryCode) {
    const regionMap = {
      // Western Europe
      'DNK': 'Western Europe', 'CHE': 'Western Europe', 'ISL': 'Western Europe',
      'NOR': 'Western Europe', 'NLD': 'Western Europe', 'SWE': 'Western Europe',
      'GBR': 'Western Europe', 'DEU': 'Western Europe', 'FRA': 'Western Europe',
      'ITA': 'Western Europe', 'ESP': 'Western Europe', 'PRT': 'Western Europe',
      'FIN': 'Western Europe', 'AUT': 'Western Europe', 'BEL': 'Western Europe',
      'IRL': 'Western Europe', 'LUX': 'Western Europe',
      
      // North America
      'USA': 'North America', 'CAN': 'North America',
      
      // East Asia
      'CHN': 'East Asia', 'JPN': 'East Asia', 'KOR': 'East Asia', 'SGP': 'East Asia',
      
      // South Asia
      'IND': 'South Asia', 'PAK': 'South Asia', 'BGD': 'South Asia', 'LKA': 'South Asia',
      
      // Latin America and Caribbean
      'BRA': 'Latin America and Caribbean', 'MEX': 'Latin America and Caribbean',
      'ARG': 'Latin America and Caribbean', 'CHL': 'Latin America and Caribbean',
      'COL': 'Latin America and Caribbean', 'PER': 'Latin America and Caribbean',
      
      // Sub-Saharan Africa
      'ZAF': 'Sub-Saharan Africa', 'NGA': 'Sub-Saharan Africa', 'GHA': 'Sub-Saharan Africa',
      'KEN': 'Sub-Saharan Africa', 'ETH': 'Sub-Saharan Africa',
      
      // Middle East and North Africa
      'EGY': 'Middle East and North Africa', 'MAR': 'Middle East and North Africa',
      'DZA': 'Middle East and North Africa', 'TUN': 'Middle East and North Africa',
      'TUR': 'Middle East and North Africa', 'ISR': 'Middle East and North Africa',
      
      // Southeast Asia
      'THA': 'Southeast Asia', 'MYS': 'Southeast Asia', 'IDN': 'Southeast Asia',
      'PHL': 'Southeast Asia', 'VNM': 'Southeast Asia',
      
      // Commonwealth of Independent States
      'RUS': 'Commonwealth of Independent States',
      
      // Central and Eastern Europe
      'POL': 'Central and Eastern Europe', 'CZE': 'Central and Eastern Europe',
      'HUN': 'Central and Eastern Europe', 'SVK': 'Central and Eastern Europe',
      'SVN': 'Central and Eastern Europe', 'EST': 'Central and Eastern Europe',
      'LVA': 'Central and Eastern Europe', 'LTU': 'Central and Eastern Europe',
      'HRV': 'Central and Eastern Europe', 'GRC': 'Central and Eastern Europe'
    };
    
    return regionMap[countryCode] || 'Other';
  }

  /**
   * Get happiness data for a specific country and date range
   * @param {string} countryCode - ISO 3-letter country code
   * @param {number} startYear - Start year
   * @param {number} endYear - End year
   * @returns {Promise<Array>} Filtered happiness data
   */
  async getHappinessData(countryCode, startYear, endYear) {
    const data = await this.loadHappinessData();
    
    return data
      .filter(item => 
        item.countryCode === countryCode &&
        item.year >= startYear &&
        item.year <= endYear
      )
      .sort((a, b) => a.year - b.year);
  }

  /**
   * Get happiness data for all countries for a specific year
   * @param {number} year - Year to get data for
   * @returns {Promise<Array>} Global happiness data
   */
  async getGlobalHappinessData(year) {
    const data = await this.loadHappinessData();
    
    return data
      .filter(item => item.year === year)
      .sort((a, b) => b.happinessScore - a.happinessScore);
  }

  /**
   * Get countries by region
   * @param {string} region - Region name
   * @returns {Promise<Array>} Countries in the region
   */
  async getCountriesByRegion(region) {
    const data = await this.loadHappinessData();
    
    const uniqueCountries = new Map();
    data
      .filter(item => item.region === region)
      .forEach(item => {
        if (!uniqueCountries.has(item.countryCode)) {
          uniqueCountries.set(item.countryCode, {
            countryCode: item.countryCode,
            country: item.country,
            region: item.region
          });
        }
      });
    
    return Array.from(uniqueCountries.values());
  }

  /**
   * Calculate correlation between happiness and other factors for India
   * @returns {Promise<Object>} Correlation analysis for India
   */
  async getIndiaCorrelationAnalysis() {
    const data = await this.loadHappinessData();
    const indiaData = data.filter(item => item.countryCode === 'IND');
    
    if (indiaData.length === 0) {
      throw new Error('No data available for India');
    }

    const factors = [
      'gdpPerCapita',
      'socialSupport', 
      'healthyLifeExpectancy',
      'freedomToMakeLifeChoices',
      'generosity',
      'perceptionsOfCorruption'
    ];

    const correlations = factors.map(factor => {
      const correlation = this.calculateCorrelation(
        indiaData.map(d => d.happinessScore),
        indiaData.map(d => d[factor])
      );
      
      return {
        factor: factor.replace(/([A-Z])/g, ' $1').toLowerCase(),
        correlation: Math.round(correlation * 1000) / 1000,
        factorCode: factor
      };
    });

    return {
      country: 'India',
      countryCode: 'IND',
      yearRange: `${Math.min(...indiaData.map(d => d.year))}-${Math.max(...indiaData.map(d => d.year))}`,
      correlations: correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   * @param {Array} x - First variable array
   * @param {Array} y - Second variable array
   * @returns {number} Correlation coefficient
   */
  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

module.exports = new HappinessService();
