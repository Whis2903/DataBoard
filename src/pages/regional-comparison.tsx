'use client';

import { useState, useEffect } from 'react';
import Plot from '../components/Charts';

interface RegionCountry {
  country: string;
  happiness_score?: number;
  indicator_value?: number;
  [key: string]: any;
}

interface RegionData {
  region: string;
  countries: RegionCountry[];
  avgHappiness?: number;
  avgIndicator?: number;
}

const RegionalComparison = () => {
  const [selectedRegion, setSelectedRegion] = useState('South Asia');
  const [selectedIndicator, setSelectedIndicator] = useState('NY.GDP.PCAP.CD');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [data, setData] = useState<RegionCountry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<string[]>([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const availableIndicators = [
    { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita' },
    { code: 'SP.POP.TOTL', name: 'Population' },
    { code: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% of GDP)' },
    { code: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% of GDP)' },
    { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)' },
  ];

  const availableYears = Array.from({ length: 14 }, (_, i) => 2024 - i);

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await fetch(`${API_BASE}/classifications/regions`);
        const result = await response.json();
        if (result.data) {
          setRegions(result.data);
        }
      } catch (err) {
        console.error('Failed to load regions:', err);
      }
    };
    loadRegions();
  }, [API_BASE]);

  // Load data when parameters change
  useEffect(() => {
    if (selectedRegion && selectedIndicator && selectedYear) {
      handleComparison();
    }
  }, [selectedRegion, selectedIndicator, selectedYear]);

  const handleComparison = async () => {
    setLoading(true);
    setError('');
    setData([]);

    try {
      // Get countries in the region
      const regionResponse = await fetch(`${API_BASE}/classifications/countries/${encodeURIComponent(selectedRegion)}`);
      if (!regionResponse.ok) {
        throw new Error(`Failed to fetch region countries: HTTP ${regionResponse.status}`);
      }
      const regionResult = await regionResponse.json();
      
      if (!regionResult.data || regionResult.data.length === 0) {
        setError(`No countries found for region: ${selectedRegion}`);
        return;
      }

      const regionCountries = regionResult.data;
      
      // Fetch happiness and indicator data for each country
      const countryPromises = regionCountries.map(async (countryInfo: any) => {
        try {
          // Get happiness data
          const happinessResponse = await fetch(`${API_BASE}/happiness/global/${selectedYear}`);
          const happinessResult = await happinessResponse.json();
          const countryHappiness = happinessResult.data?.find((h: any) => 
            h.country?.toLowerCase() === countryInfo.name?.toLowerCase()
          );

          // Get indicator data
          const indicatorResponse = await fetch(
            `${API_BASE}/indicator/${countryInfo.code}/${selectedIndicator}?start=${selectedYear}&end=${selectedYear}`
          );
          const indicatorResult = await indicatorResponse.json();
          const indicatorValue = indicatorResult.data?.[0]?.value;

          return {
            country: countryInfo.name,
            countryCode: countryInfo.code,
            happiness_score: countryHappiness?.happinessScore || null,
            indicator_value: indicatorValue ? parseFloat(indicatorValue) : null,
            region: selectedRegion
          };
        } catch (err) {
          console.error(`Failed to fetch data for ${countryInfo.name}:`, err);
          return {
            country: countryInfo.name,
            countryCode: countryInfo.code,
            happiness_score: null,
            indicator_value: null,
            region: selectedRegion
          };
        }
      });

      const results = await Promise.all(countryPromises);
      
      // Filter out countries with missing data and sort by indicator value
      const validResults = results
        .filter(country => country.indicator_value !== null)
        .sort((a, b) => (b.indicator_value || 0) - (a.indicator_value || 0));

      setData(validResults);
    } catch (err) {
      setError('Failed to fetch regional comparison data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorName = (code: string) => {
    return availableIndicators.find(ind => ind.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🌏 Regional Comparison</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Indicator Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indicator
            </label>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {availableIndicators.map((indicator) => (
                <option key={indicator.code} value={indicator.code}>
                  {indicator.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading regional comparison data...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {/* Regional Statistics */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📊 {selectedRegion} Overview ({selectedYear})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Countries Analyzed</p>
              <p className="text-2xl font-bold text-blue-900">{data.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Top Performer</p>
              <p className="text-lg font-bold text-green-900">{data[0]?.country}</p>
              <p className="text-sm text-green-600">{data[0]?.indicator_value?.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Average {getIndicatorName(selectedIndicator)}</p>
              <p className="text-2xl font-bold text-yellow-900">
                {(data.reduce((sum, c) => sum + (c.indicator_value || 0), 0) / data.length).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Average Happiness</p>
              <p className="text-2xl font-bold text-purple-900">
                {(data.filter(c => c.happiness_score).reduce((sum, c) => sum + (c.happiness_score || 0), 0) / 
                  data.filter(c => c.happiness_score).length || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Country Ranking Chart */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🏆 Countries Ranked by {getIndicatorName(selectedIndicator)}
          </h3>
          
          <div className="h-96">
            <Plot
              data={[{
                x: data.map(item => item.indicator_value || 0),
                y: data.map(item => item.country),
                type: 'bar',
                orientation: 'h',
                marker: { color: '#3b82f6' },
                name: getIndicatorName(selectedIndicator)
              }]}
              layout={{
                title: {
                  text: `Countries Ranked by ${getIndicatorName(selectedIndicator)}`,
                  font: { size: 16 }
                },
                xaxis: { title: { text: getIndicatorName(selectedIndicator) } },
                yaxis: { title: { text: 'Countries' } },
                autosize: true,
                margin: { l: 120, r: 50, t: 80, b: 60 },
                showlegend: false
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Detailed Table */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📋 Detailed Rankings
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getIndicatorName(selectedIndicator)}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Happiness Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((country, index) => (
                  <tr key={country.country} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {country.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {country.indicator_value?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {country.happiness_score?.toFixed(2) || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionalComparison;
