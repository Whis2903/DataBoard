'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ScaleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Plot from '../components/Charts';
import Card from '../components/Card';

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
    { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita', icon: '💰', unit: 'USD' },
    { code: 'SP.POP.TOTL', name: 'Population', icon: '👥', unit: 'people' },
    { code: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% of GDP)', icon: '🏥', unit: '%' },
    { code: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% of GDP)', icon: '🎓', unit: '%' },
    { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)', icon: '🏢', unit: 'USD' },
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
    { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
    { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
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

  const getCorrelationStrength = (corr: number | null) => {
    if (corr === null) return { label: 'No data', color: 'text-slate-400', bgColor: 'bg-slate-500/20' };
    const abs = Math.abs(corr);
    if (abs >= 0.8) return { label: 'Very Strong', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
    if (abs >= 0.6) return { label: 'Strong', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (abs >= 0.4) return { label: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (abs >= 0.2) return { label: 'Weak', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { label: 'Very Weak', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData([]);
    setCorrelation(null);

    try {
      const [happinessResponse, indicatorResponse] = await Promise.all([
        fetch(`${API_BASE}/happiness/${selectedCountry}?start=${startYear}&end=${endYear}`),
        fetch(`${API_BASE}/indicator/${selectedCountry}/${selectedIndicator}?start=${startYear}&end=${endYear}`)
      ]);

      if (!happinessResponse.ok) {
        throw new Error(`Failed to fetch happiness data: HTTP ${happinessResponse.status}`);
      }

      if (!indicatorResponse.ok) {
        throw new Error(`Failed to fetch indicator data: HTTP ${indicatorResponse.status}`);
      }

      const [happinessResult, indicatorResult] = await Promise.all([
        happinessResponse.json(),
        indicatorResponse.json()
      ]);

      const happinessData = happinessResult.data || [];
      const indicatorData = indicatorResult.data || [];
      const combinedData: ComparisonData[] = [];
      const indicatorName = availableIndicators.find(ind => ind.code === selectedIndicator)?.name || selectedIndicator;

      for (let year = startYear; year <= endYear; year++) {
        const happinessItem = happinessData.find((item: { year: number }) => item.year === year);
        const indicatorItem = indicatorData.find((item: { year: string }) => parseInt(item.year) === year);

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
      toast.success('Correlation analysis complete!');
    } catch (err) {
      setError('Failed to fetch comparison data');
      toast.error('Failed to load comparison data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedIndicatorInfo = availableIndicators.find(ind => ind.code === selectedIndicator);
  const selectedCountryInfo = countries.find(c => c.code === selectedCountry);
  const correlationInfo = getCorrelationStrength(correlation);

  return (
    <div className="space-y-8">
      <Card 
        title="Indicator vs Happiness Correlation"
        subtitle="Analyze the relationship between economic/social indicators and happiness levels"
        className="shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-600/30">
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">Country</div>
              <div className="font-medium text-slate-200">
                {selectedCountryInfo?.flag} {selectedCountryInfo?.name}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">Indicator</div>
              <div className="font-medium text-slate-200">
                {selectedIndicatorInfo?.icon} {selectedIndicatorInfo?.name}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">Time Period</div>
              <div className="font-medium text-slate-200">
                {startYear} - {endYear}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

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

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing Correlation...
              </>
            ) : (
              <>
                <ScaleIcon className="w-5 h-5" />
                Analyze Correlation
              </>
            )}
          </motion.button>
        </form>
      </Card>

      {correlation !== null && (
        <Card className="shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {correlation.toFixed(3)}
              </div>
              <div className="text-slate-400">Correlation Coefficient</div>
              <div className="text-sm text-slate-500 mt-1">
                Range: -1.0 to +1.0
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${correlationInfo.color} mb-2`}>
                {correlationInfo.label}
              </div>
              <div className="text-slate-400">Relationship Strength</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${correlationInfo.bgColor} ${correlationInfo.color}`}>
                {correlation > 0 ? 'Positive' : correlation < 0 ? 'Negative' : 'Neutral'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {data.length}
              </div>
              <div className="text-slate-400">Data Points</div>
              <div className="text-sm text-slate-500 mt-1">
                {startYear}-{endYear}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-900/30 rounded-xl">
            <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-400" />
              Interpretation
            </h4>
            <p className="text-slate-400 text-sm">
              {correlation > 0.6 && 
                `Strong positive correlation: As ${selectedIndicatorInfo?.name} increases, happiness tends to increase significantly.`}
              {correlation > 0.2 && correlation <= 0.6 && 
                `Moderate positive correlation: ${selectedIndicatorInfo?.name} shows some positive relationship with happiness.`}
              {correlation >= -0.2 && correlation <= 0.2 && 
                `Weak correlation: Little to no linear relationship between ${selectedIndicatorInfo?.name} and happiness.`}
              {correlation >= -0.6 && correlation < -0.2 && 
                `Moderate negative correlation: As ${selectedIndicatorInfo?.name} increases, happiness tends to decrease somewhat.`}
              {correlation < -0.6 && 
                `Strong negative correlation: As ${selectedIndicatorInfo?.name} increases, happiness tends to decrease significantly.`}
            </p>
          </div>
        </Card>
      )}

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

      {data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card 
            title="Trend Over Time"
            subtitle="Compare happiness and indicator trends"
            className="shadow-xl"
          >
            <div className="h-80 bg-slate-900/30 rounded-xl p-4">
              <Plot
                data={[
                  {
                    x: data.map(d => d.year),
                    y: data.map(d => d.happiness),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Happiness Score',
                    line: { color: '#3b82f6', width: 3 },
                    marker: { size: 8, color: '#3b82f6' },
                    yaxis: 'y'
                  },
                  {
                    x: data.map(d => d.year),
                    y: data.map(d => d.indicator),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: selectedIndicatorInfo?.name,
                    line: { color: '#8b5cf6', width: 3 },
                    marker: { size: 8, color: '#8b5cf6' },
                    yaxis: 'y2'
                  }
                ]}
                layout={{
                  title: { text: '', font: { color: '#f8fafc' } },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: { 
                    title: { text: 'Year', font: { color: '#94a3b8' } },
                    color: '#94a3b8',
                    gridcolor: '#334155'
                  },
                  yaxis: { 
                    title: { text: 'Happiness Score', font: { color: '#3b82f6' } },
                    color: '#3b82f6',
                    gridcolor: '#334155',
                    side: 'left'
                  },
                  yaxis2: {
                    title: { text: selectedIndicatorInfo?.name, font: { color: '#8b5cf6' } },
                    color: '#8b5cf6',
                    overlaying: 'y',
                    side: 'right'
                  },
                  legend: { 
                    x: 0.02, 
                    y: 0.98,
                    bgcolor: 'rgba(30, 41, 59, 0.8)',
                    bordercolor: '#475569',
                    borderwidth: 1,
                    font: { color: '#f8fafc' }
                  },
                  margin: { l: 60, r: 60, t: 20, b: 60 },
                  hovermode: 'x unified',
                  font: { color: '#f8fafc' }
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </Card>

          <Card 
            title="Correlation Scatter Plot"
            subtitle="Relationship between indicator and happiness"
            className="shadow-xl"
          >
            <div className="h-80 bg-slate-900/30 rounded-xl p-4">
              <Plot
                data={[{
                  x: data.map(d => d.indicator),
                  y: data.map(d => d.happiness),
                  type: 'scatter',
                  mode: 'markers',
                  marker: { 
                    size: 12, 
                    color: data.map(d => d.year),
                    colorscale: 'Viridis',
                    showscale: true,
                    colorbar: {
                      title: { text: 'Year', font: { color: '#f8fafc' } },
                      tickfont: { color: '#f8fafc' }
                    }
                  },
                  text: data.map(d => `Year: ${d.year}<br>Happiness: ${d.happiness}<br>${selectedIndicatorInfo?.name}: ${d.indicator}`),
                  hovertemplate: '%{text}<extra></extra>'
                }]}
                layout={{
                  title: { text: '', font: { color: '#f8fafc' } },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: { 
                    title: { text: selectedIndicatorInfo?.name, font: { color: '#94a3b8' } },
                    color: '#94a3b8',
                    gridcolor: '#334155'
                  },
                  yaxis: { 
                    title: { text: 'Happiness Score', font: { color: '#94a3b8' } },
                    color: '#94a3b8',
                    gridcolor: '#334155'
                  },
                  margin: { l: 60, r: 60, t: 20, b: 60 },
                  font: { color: '#f8fafc' }
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IndicatorComparison;
