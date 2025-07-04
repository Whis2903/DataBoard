'use client';

import { useState, useEffect } from 'react';
import Plot from '../components/Charts';

interface IndicatorData {
  year: number;
  [key: string]: number;
}

const IndicatorTrends = () => {
  // Updated to compare two countries on a single indicator
  const [selectedCountry1, setSelectedCountry1] = useState('IND');
  const [selectedCountry2, setSelectedCountry2] = useState('USA');
  const [selectedIndicator, setSelectedIndicator] = useState('NY.GDP.MKTP.CD');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2022);
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Updated with better error handling
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const availableIndicators = [
    { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)' },
    { code: 'SP.POP.TOTL', name: 'Population' },
    { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita' },
    { code: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% of GDP)' },
    { code: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% of GDP)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData([]);

    try {
      // Fetch data for the selected indicator for both countries
      const countryPromises = [selectedCountry1, selectedCountry2].map(async (country) => {
        try {
          const response = await fetch(
            `${API_BASE}/indicator/${country}/${selectedIndicator}?start=${startYear}&end=${endYear}`
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const result = await response.json();
          return { country, data: result.data || [] };
        } catch (error) {
          console.error(`Failed to fetch data for country ${country}:`, error);
          return { country, data: [] };
        }
      });

      const results = await Promise.all(countryPromises);
      
      // Combine data by year
      const combinedData: IndicatorData[] = [];
      const yearSet = new Set<number>();

      // Collect all years
      results.forEach(({ data: countryData }) => {
        countryData.forEach((item: any) => {
          if (item.value !== null) {
            yearSet.add(parseInt(item.year));
          }
        });
      });

      // Create data structure
      Array.from(yearSet).sort().forEach(year => {
        const yearData: IndicatorData = { year };
        
        results.forEach(({ country, data: countryData }) => {
          const yearItem = countryData.find((item: any) => parseInt(item.year) === year);
          if (yearItem && yearItem.value !== null) {
            yearData[country] = parseFloat(yearItem.value);
          }
        });

        combinedData.push(yearData);
      });

      setData(combinedData);
    } catch (err) {
      setError('Failed to fetch indicator trends for country comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Country Comparison for Single Indicator</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* First Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country 1
              </label>
              <select
                value={selectedCountry1}
                onChange={(e) => setSelectedCountry1(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="IND">India</option>
                <option value="USA">United States</option>
                <option value="CHN">China</option>
                <option value="DEU">Germany</option>
                <option value="JPN">Japan</option>
                <option value="GBR">United Kingdom</option>
                <option value="FRA">France</option>
                <option value="BRA">Brazil</option>
              </select>
            </div>

            {/* Second Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country 2
              </label>
              <select
                value={selectedCountry2}
                onChange={(e) => setSelectedCountry2(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USA">United States</option>
                <option value="IND">India</option>
                <option value="CHN">China</option>
                <option value="DEU">Germany</option>
                <option value="JPN">Japan</option>
                <option value="GBR">United Kingdom</option>
                <option value="FRA">France</option>
                <option value="BRA">Brazil</option>
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

            {/* Start Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Year
              </label>
              <input
                type="number"
                min="2000"
                max="2024"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Year
              </label>
              <input
                type="number"
                min="2000"
                max="2024"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Compare Countries'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {/* Chart */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {availableIndicators.find(ind => ind.code === selectedIndicator)?.name} Comparison: {selectedCountry1} vs {selectedCountry2} ({startYear}-{endYear})
          </h3>
          
          <div className="h-96">
            <Plot
              data={Object.keys(data[0] || {}).filter(key => key !== 'year').map((country, index) => ({
                x: data.map(item => item.year),
                y: data.map(item => item[country]),
                type: 'scatter',
                mode: 'lines+markers',
                name: country === selectedCountry1 ? `${selectedCountry1}` : `${selectedCountry2}`,
                line: { color: colors[index % colors.length], width: 3 },
                marker: { size: 8 }
              }))}
              layout={{
                title: {
                  text: `${availableIndicators.find(ind => ind.code === selectedIndicator)?.name}: ${selectedCountry1} vs ${selectedCountry2}`,
                  font: { size: 16 }
                },
                xaxis: { title: { text: 'Year' } },
                yaxis: { 
                  title: { 
                    text: availableIndicators.find(ind => ind.code === selectedIndicator)?.name || 'Value'
                  } 
                },
                autosize: true,
                margin: { l: 80, r: 50, t: 80, b: 60 },
                showlegend: true,
                legend: { 
                  x: 0.02, 
                  y: 0.98,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  bordercolor: '#ddd',
                  borderwidth: 1
                },
                hovermode: 'x unified'
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Country Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[selectedCountry1, selectedCountry2].map((country, index) => {
              const countryData = data.filter(item => item[country] !== undefined).map(item => item[country]);
              const avgValue = countryData.length > 0 ? countryData.reduce((sum, val) => sum + val, 0) / countryData.length : 0;
              const latestValue = countryData.length > 0 ? countryData[countryData.length - 1] : 0;
              const growth = countryData.length > 1 ? ((latestValue - countryData[0]) / countryData[0] * 100) : 0;

              return (
                <div key={country} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{country} Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latest Value ({endYear}):</span>
                      <span className="font-semibold">{latestValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average ({startYear}-{endYear}):</span>
                      <span className="font-semibold">{avgValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth Rate:</span>
                      <span className={`font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorTrends;
