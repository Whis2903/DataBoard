'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Plot from '../components/Charts';
import Card from '../components/Card';

interface IndicatorData {
  year: number;
  [key: string]: number;
}

const IndicatorTrends = () => {
  const [selectedCountry1, setSelectedCountry1] = useState('IND');
  const [selectedCountry2, setSelectedCountry2] = useState('USA');
  const [selectedIndicator, setSelectedIndicator] = useState('NY.GDP.MKTP.CD');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2022);
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const availableIndicators = [
    { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)', icon: '💰' },
    { code: 'SP.POP.TOTL', name: 'Population', icon: '👥' },
    { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita', icon: '📊' },
    { code: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% of GDP)', icon: '🏥' },
    { code: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% of GDP)', icon: '🎓' },
  ];

  const countries = [
    { code: 'IND', name: 'India', flag: '🇮🇳' },
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'CHN', name: 'China', flag: '🇨🇳' },
    { code: 'DEU', name: 'Germany', flag: '🇩🇪' },
    { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
    { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'FRA', name: 'France', flag: '🇫🇷' },
    { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  ];

  const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData([]);

    try {
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
          toast.error(`Failed to load data for ${country}`);
          return { country, data: [] };
        }
      });

      const results = await Promise.all(countryPromises);
      
      const combinedData: IndicatorData[] = [];
      const yearSet = new Set<number>();

      results.forEach(({ data: countryData }) => {
        countryData.forEach((item: { value: string | null; year: string }) => {
          if (item.value !== null) {
            yearSet.add(parseInt(item.year));
          }
        });
      });

      Array.from(yearSet).sort().forEach(year => {
        const yearData: IndicatorData = { year };
        
        results.forEach(({ country, data: countryData }) => {
          const yearItem = countryData.find((item: { year: string; value: string | null }) => parseInt(item.year) === year);
          if (yearItem && yearItem.value !== null) {
            yearData[country] = parseFloat(yearItem.value);
          }
        });

        combinedData.push(yearData);
      });

      setData(combinedData);
      toast.success('Data loaded successfully!');
    } catch (err) {
      setError('Failed to fetch indicator trends for country comparison');
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedIndicatorInfo = availableIndicators.find(ind => ind.code === selectedIndicator);
  const country1Info = countries.find(c => c.code === selectedCountry1);
  const country2Info = countries.find(c => c.code === selectedCountry2);

  return (
    <div className="space-y-8">
      <Card 
        title="Country Comparison for Single Indicator"
        subtitle="Compare economic and social indicators between two countries over time"
        className="shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Selection Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-600/30">
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">Country 1</div>
              <div className="font-medium text-slate-200">
                {country1Info?.flag} {country1Info?.name}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">Indicator</div>
              <div className="font-medium text-slate-200">
                {selectedIndicatorInfo?.icon} {selectedIndicatorInfo?.name}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">Country 2</div>
              <div className="font-medium text-slate-200">
                {country2Info?.flag} {country2Info?.name}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Country 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                First Country
              </label>
              <select
                value={selectedCountry1}
                onChange={(e) => setSelectedCountry1(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country 2 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Second Country
              </label>
              <select
                value={selectedCountry2}
                onChange={(e) => setSelectedCountry2(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicator */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Indicator
              </label>
              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {availableIndicators.map((indicator) => (
                  <option key={indicator.code} value={indicator.code}>
                    {indicator.icon} {indicator.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Year */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Start Year
              </label>
              <input
                type="number"
                min="2000"
                max="2024"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* End Year */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                End Year
              </label>
              <input
                type="number"
                min="2000"
                max="2024"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Loading Analysis...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Compare Countries
              </>
            )}
          </motion.button>
        </form>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <p className="text-red-400 flex items-center gap-2">
            ❌ {error}
          </p>
        </motion.div>
      )}

      {/* Chart Display */}
      {data.length > 0 && (
        <Card
          title={`${selectedIndicatorInfo?.name} Comparison`}
          subtitle={`${country1Info?.name} vs ${country2Info?.name} (${startYear}-${endYear})`}
          className="shadow-xl"
        >
          <div className="h-96 bg-slate-900/30 rounded-xl p-4">
            <Plot
              data={Object.keys(data[0] || {}).filter(key => key !== 'year').map((country, index) => ({
                x: data.map(item => item.year),
                y: data.map(item => item[country]),
                type: 'scatter',
                mode: 'lines+markers',
                name: countries.find(c => c.code === country)?.name || country,
                line: { color: colors[index % colors.length], width: 3 },
                marker: { size: 8, color: colors[index % colors.length] }
              }))}
              layout={{
                title: {
                  text: '',
                  font: { size: 16, color: '#f8fafc' }
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                xaxis: { 
                  title: { text: 'Year', font: { color: '#94a3b8' } },
                  color: '#94a3b8',
                  gridcolor: '#334155'
                },
                yaxis: { 
                  title: { 
                    text: selectedIndicatorInfo?.name || 'Value',
                    font: { color: '#94a3b8' }
                  },
                  color: '#94a3b8',
                  gridcolor: '#334155'
                },
                autosize: true,
                margin: { l: 80, r: 50, t: 50, b: 60 },
                showlegend: true,
                legend: { 
                  x: 0.02, 
                  y: 0.98,
                  bgcolor: 'rgba(30, 41, 59, 0.8)',
                  bordercolor: '#475569',
                  borderwidth: 1,
                  font: { color: '#f8fafc' }
                },
                hovermode: 'x unified',
                font: { color: '#f8fafc' }
              }}
              config={{ 
                responsive: true, 
                displayModeBar: false,
                toImageButtonOptions: {
                  format: 'png',
                  filename: 'country_comparison',
                  height: 500,
                  width: 700,
                  scale: 1
                }
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </Card>
      )}

      {/* Summary Statistics */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[selectedCountry1, selectedCountry2].map((countryCode) => {
            const countryInfo = countries.find(c => c.code === countryCode);
            const countryData = data.map(d => d[countryCode]).filter(v => v !== undefined);
            const avgValue = countryData.reduce((sum, val) => sum + val, 0) / countryData.length;
            const minValue = Math.min(...countryData);
            const maxValue = Math.max(...countryData);
            const growth = ((countryData[countryData.length - 1] - countryData[0]) / countryData[0]) * 100;

            return (
              <Card key={countryCode} className="shadow-lg">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">
                    {countryInfo?.flag} {countryInfo?.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {avgValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-slate-400">Average</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-400">Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-300">
                        {minValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-slate-400">Minimum</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-300">
                        {maxValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-slate-400">Maximum</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IndicatorTrends;
