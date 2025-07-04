'use client';

import { useState, useEffect } from 'react';

interface CountryData {
  country: string;
  happinessScore: number;
  region: string;
  rank?: number;
}

const WorldMap = () => {
  const [selectedYear, setSelectedYear] = useState(2023);
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const availableYears = Array.from({ length: 14 }, (_, i) => 2024 - i);

  useEffect(() => {
    handleYearChange();
  }, [selectedYear]);

  const handleYearChange = async () => {
    setLoading(true);
    setError('');
    setData([]);

    try {
      const response = await fetch(`${API_BASE}/happiness/global/${selectedYear}`);
      const result = await response.json();
      
      if (result.data) {
        // Sort by happiness score and add ranks
        const sortedData = result.data
          .sort((a: CountryData, b: CountryData) => b.happinessScore - a.happinessScore)
          .map((item: CountryData, index: number) => ({
            ...item,
            rank: index + 1
          }));
        
        setData(sortedData);
      }
    } catch (err) {
      setError('Failed to fetch happiness distribution data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHappinessColor = (score: number) => {
    if (score >= 7) return 'bg-green-600';
    if (score >= 6) return 'bg-green-400';
    if (score >= 5) return 'bg-yellow-400';
    if (score >= 4) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getHappinessLabel = (score: number) => {
    if (score >= 7) return 'Very Happy';
    if (score >= 6) return 'Happy';
    if (score >= 5) return 'Moderate';
    if (score >= 4) return 'Low';
    return 'Very Low';
  };

  // Group countries by region
  const groupedByRegion = data.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, CountryData[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🗺️ World Happiness Distribution</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-48 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Color Legend */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Happiness Score Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm">Very Happy (7.0+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm">Happy (6.0-6.9)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm">Moderate (5.0-5.9)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-sm">Low (4.0-4.9)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm">Very Low (&lt; 4.0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading happiness data for {selectedYear}...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {/* Top 10 Countries */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🏆 Top 10 Happiest Countries ({selectedYear})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.slice(0, 10).map((country, index) => (
              <div
                key={country.country}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-600">#{country.rank}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{country.country}</p>
                    <p className="text-sm text-gray-600">{country.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-white text-sm ${getHappinessColor(country.happinessScore)}`}>
                    {country.happinessScore.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getHappinessLabel(country.happinessScore)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Overview */}
      {Object.keys(groupedByRegion).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🌍 Regional Overview ({selectedYear})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedByRegion).map(([region, countries]) => {
              const avgScore = countries.reduce((sum, c) => sum + c.happinessScore, 0) / countries.length;
              const topCountry = countries[0];
              
              return (
                <div key={region} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{region}</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <strong>Countries:</strong> {countries.length}
                    </p>
                    <p className="text-gray-600">
                      <strong>Avg Score:</strong> {avgScore.toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      <strong>Top Country:</strong> {topCountry.country} ({topCountry.happinessScore.toFixed(2)})
                    </p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-white text-xs ${getHappinessColor(avgScore)}`}>
                      {getHappinessLabel(avgScore)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Note about map visualization */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📍 Map Visualization Note</h4>
        <p className="text-blue-800 text-sm">
          Interactive world map visualization would be displayed here using libraries like react-simple-maps or Leaflet. 
          For now, the data is presented in ranked lists and regional summaries above.
        </p>
      </div>
    </div>
  );
};

export default WorldMap;
