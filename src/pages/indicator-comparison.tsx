'use client';

import { useState, useEffect } from 'react';
import Plot from '../components/Charts';

interface ComparisonData {
  year: number;
  happiness: number;
  indicator: number;
  indicatorName: string;
}

const IndicatorComparison = () => {
  const [selectedCountry, setSelectedCountry] = useState('IND');
  const [selectedIndicator, setSelectedIndicator] = useState('NY.GDP.PCAP.CD');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2022);
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [correlation, setCorrelation] = useState<number | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const availableIndicators = [
    { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita' },
    { code: 'SP.POP.TOTL', name: 'Population' },
    { code: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% of GDP)' },
    { code: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% of GDP)' },
    { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)' },
  ];

  const calculateCorrelation = (data: ComparisonData[]) => {
    if (data.length < 2) return null;
    
    const validData = data.filter(d => d.happiness !== null && d.indicator !== null);
    if (validData.length < 2) return null;

    const n = validData.length;
    const sumX = validData.reduce((sum, d) => sum + d.happiness, 0);
    const sumY = validData.reduce((sum, d) => sum + d.indicator, 0);
    const sumXY = validData.reduce((sum, d) => sum + (d.happiness * d.indicator), 0);
    const sumX2 = validData.reduce((sum, d) => sum + (d.happiness * d.happiness), 0);
    const sumY2 = validData.reduce((sum, d) => sum + (d.indicator * d.indicator), 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData([]);
    setCorrelation(null);

    try {
      const happinessResponse = await fetch(
        `${API_BASE}/happiness/${selectedCountry}?start=${startYear}&end=${endYear}`
      );
      if (!happinessResponse.ok) {
        throw new Error(`Failed to fetch happiness data: HTTP ${happinessResponse.status}`);
      }
      const happinessResult = await happinessResponse.json();

      const indicatorResponse = await fetch(
        `${API_BASE}/indicator/${selectedCountry}/${selectedIndicator}?start=${startYear}&end=${endYear}`
      );
      if (!indicatorResponse.ok) {
        throw new Error(`Failed to fetch indicator data: HTTP ${indicatorResponse.status}`);
      }
      const indicatorResult = await indicatorResponse.json();

      const happinessData = happinessResult.data || [];
      const indicatorData = indicatorResult.data || [];

      const combinedData: ComparisonData[] = [];
      const indicatorName = availableIndicators.find(ind => ind.code === selectedIndicator)?.name || selectedIndicator;

      for (let year = startYear; year <= endYear; year++) {
        const happinessItem = happinessData.find((item: any) => item.year === year);
        const indicatorItem = indicatorData.find((item: any) => parseInt(item.year) === year);

        if (happinessItem && indicatorItem && indicatorItem.value !== null) {
          combinedData.push({
            year,
            happiness: parseFloat(happinessItem.happinessScore),
            indicator: parseFloat(indicatorItem.value),
            indicatorName
          });
        }
      }

      setData(combinedData);
      setCorrelation(calculateCorrelation(combinedData));
    } catch (err) {
      setError('Failed to fetch comparison data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔄 Compare Indicator with Happiness Index</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
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

            {}
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

            {}
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

            {}
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

            {}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Compare'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {}
      {correlation !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Correlation Analysis</h3>
          <p className="text-blue-800">
            <strong>Correlation coefficient:</strong> {correlation.toFixed(3)}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak'} 
            {correlation > 0 ? ' positive' : ' negative'} correlation between happiness and the selected indicator.
          </p>
        </div>
      )}

      {}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Happiness vs {data[0]?.indicatorName} for {selectedCountry}
          </h3>
          
          <div className="h-96">
            <Plot
              data={[
                {
                  x: data.map(item => item.year),
                  y: data.map(item => item.happiness),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Happiness Score',
                  line: { color: '#8884d8', width: 3 },
                  marker: { size: 8 },
                  yaxis: 'y'
                },
                {
                  x: data.map(item => item.year),
                  y: data.map(item => item.indicator),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: data[0]?.indicatorName,
                  line: { color: '#82ca9d', width: 3 },
                  marker: { size: 8 },
                  yaxis: 'y2'
                }
              ]}
              layout={{
                title: {
                  text: `Happiness vs ${data[0]?.indicatorName} for ${selectedCountry}`,
                  font: { size: 16 }
                },
                xaxis: { title: { text: 'Year' } },
                yaxis: { 
                  title: { text: 'Happiness Score' },
                  side: 'left'
                },
                yaxis2: {
                  title: { text: data[0]?.indicatorName },
                  side: 'right',
                  overlaying: 'y'
                },
                autosize: true,
                margin: { l: 60, r: 60, t: 80, b: 60 },
                showlegend: true,
                legend: { x: 0, y: 1 },
                hovermode: 'x unified'
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorComparison;
