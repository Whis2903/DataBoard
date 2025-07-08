'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  GlobeAsiaAustraliaIcon, 
  ChartBarIcon,
  MapPinIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import Plot from '../components/Charts';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

interface RegionCountry {
  country: string;
  happiness_score?: number;
  indicator_value?: number;
  countryCode?: string;
  region?: string;
  [key: string]: any;
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
    { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita', icon: '💰', unit: 'USD' },
    { code: 'SP.POP.TOTL', name: 'Population', icon: '👥', unit: 'people' },
    { code: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% of GDP)', icon: '🏥', unit: '%' },
    { code: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% of GDP)', icon: '🎓', unit: '%' },
    { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)', icon: '🏛️', unit: 'USD' },
  ];

  const availableYears = Array.from({ length: 14 }, (_, i) => 2024 - i);

  const regionFlags: Record<string, string> = {
    'South Asia': '🇮🇳',
    'Europe & Central Asia': '🇪🇺',
    'Middle East & North Africa': '🕌',
    'Sub-Saharan Africa': '🌍',
    'Latin America & Caribbean': '🌎',
    'East Asia & Pacific': '🌏',
    'North America': '🇺🇸'
  };

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
        toast.error('Failed to load regions');
      }
    };
    loadRegions();
  }, [API_BASE]);

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
      
      const countryPromises = regionCountries.map(async (countryInfo: any) => {
        try {
          const happinessResponse = await fetch(`${API_BASE}/happiness/global/${selectedYear}`);
          const happinessResult = await happinessResponse.json();
          const countryHappiness = happinessResult.data?.find((h: any) => 
            h.country?.toLowerCase() === countryInfo.name?.toLowerCase()
          );

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
      
      const validResults = results
        .filter(country => country.indicator_value !== null)
        .sort((a, b) => (b.indicator_value || 0) - (a.indicator_value || 0));

      setData(validResults);
      toast.success(`Loaded data for ${validResults.length} countries in ${selectedRegion}`);
    } catch (err) {
      setError('Failed to fetch regional comparison data');
      toast.error('Failed to load regional data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedIndicatorInfo = availableIndicators.find(ind => ind.code === selectedIndicator);
  const regionStats = data.length > 0 ? {
    avgIndicator: data.reduce((sum, c) => sum + (c.indicator_value || 0), 0) / data.length,
    avgHappiness: data.filter(c => c.happiness_score).reduce((sum, c) => sum + (c.happiness_score || 0), 0) / data.filter(c => c.happiness_score).length,
    topCountry: data[0],
    totalCountries: data.length
  } : null;

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <GlobeAsiaAustraliaIcon className="w-8 h-8 text-cyan-400" />
              Regional Comparison
            </h2>
            <p className="text-slate-400 mt-2">
              Compare countries within specific regions across key indicators
            </p>
          </div>
          
          <div className="text-6xl">
            {regionFlags[selectedRegion] || '🌍'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {regionFlags[region] || '🌍'} {region}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Indicator
            </label>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            >
              {availableIndicators.map((indicator) => (
                <option key={indicator.code} value={indicator.code}>
                  {indicator.icon} {indicator.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-600/30">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Current Analysis</div>
            <div className="font-medium text-slate-200">
              {selectedIndicatorInfo?.icon} {selectedIndicatorInfo?.name} in {regionFlags[selectedRegion]} {selectedRegion} ({selectedYear})
            </div>
          </div>
        </div>
      </Card>

      {regionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hoverable={false} className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {regionStats.totalCountries}
            </div>
            <div className="text-slate-400">Countries</div>
          </Card>
          
          <Card hoverable={false} className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {regionStats.avgIndicator.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-slate-400">Avg {selectedIndicatorInfo?.name}</div>
          </Card>

          <Card hoverable={false} className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {regionStats.avgHappiness.toFixed(2)}
            </div>
            <div className="text-slate-400">Avg Happiness</div>
          </Card>

          <Card hoverable={false} className="text-center">
            <div className="text-lg font-bold text-purple-400 mb-2">
              {regionStats.topCountry?.country}
            </div>
            <div className="text-slate-400">Top Performer</div>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" text={`Loading ${selectedRegion} data...`} />
        </Card>
      )}

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

      {/* Main Comparison Results */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <Card 
            title={`${selectedIndicatorInfo?.name} by Country`}
            subtitle={`${selectedRegion} - ${selectedYear}`}
            className="shadow-xl"
          >
            <div className="h-96 bg-slate-900/30 rounded-xl p-4">
              <Plot
                data={[{
                  x: data.slice(0, 10).map(d => d.country),
                  y: data.slice(0, 10).map(d => d.indicator_value || 0),
                  type: 'bar',
                  marker: {
                    color: data.slice(0, 10).map((_, index) => 
                      `rgba(${59 + index * 20}, ${130 + index * 10}, ${246 - index * 5}, 0.8)`
                    ),
                    line: {
                      color: '#1e293b',
                      width: 1
                    }
                  },
                  text: data.slice(0, 10).map(d => 
                    (d.indicator_value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                  ),
                  textposition: 'auto',
                  hovertemplate: '%{x}<br>%{y:,.2f} ' + (selectedIndicatorInfo?.unit || '') + '<extra></extra>'
                }]}
                layout={{
                  title: {
                    text: '',
                    font: { color: '#f8fafc' }
                  },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: {
                    title: { text: 'Countries', font: { color: '#94a3b8' } },
                    color: '#94a3b8',
                    gridcolor: '#334155',
                    tickangle: -45
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
                  margin: { l: 80, r: 50, t: 50, b: 120 },
                  font: { color: '#f8fafc', size: 12 }
                }}
                config={{
                  responsive: true,
                  displayModeBar: false
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </Card>

          {/* Scatter Plot: Indicator vs Happiness */}
          <Card 
            title="Indicator vs Happiness Correlation"
            subtitle="Explore the relationship between the indicator and happiness"
            className="shadow-xl"
          >
            <div className="h-96 bg-slate-900/30 rounded-xl p-4">
              <Plot
                data={[{
                  x: data.filter(d => d.happiness_score && d.indicator_value).map(d => d.indicator_value || 0),
                  y: data.filter(d => d.happiness_score && d.indicator_value).map(d => d.happiness_score || 0),
                  mode: 'markers',
                  type: 'scatter',
                  text: data.filter(d => d.happiness_score && d.indicator_value).map(d => d.country),
                  marker: {
                    size: 12,
                    color: '#06b6d4',
                    opacity: 0.7,
                    line: {
                      color: '#0891b2',
                      width: 2
                    }
                  },
                  hovertemplate: '%{text}<br>%{x:,.2f} ' + (selectedIndicatorInfo?.unit || '') + '<br>Happiness: %{y:.2f}<extra></extra>'
                }]}
                layout={{
                  title: {
                    text: '',
                    font: { color: '#f8fafc' }
                  },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: {
                    title: { 
                      text: selectedIndicatorInfo?.name || 'Indicator Value', 
                      font: { color: '#94a3b8' } 
                    },
                    color: '#94a3b8',
                    gridcolor: '#334155'
                  },
                  yaxis: {
                    title: { text: 'Happiness Score', font: { color: '#94a3b8' } },
                    color: '#94a3b8',
                    gridcolor: '#334155'
                  },
                  autosize: true,
                  margin: { l: 80, r: 50, t: 50, b: 80 },
                  font: { color: '#f8fafc', size: 12 }
                }}
                config={{
                  responsive: true,
                  displayModeBar: false
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Country Rankings */}
      {data.length > 0 && (
        <Card 
          title="Country Rankings"
          subtitle={`${selectedRegion} countries ranked by ${selectedIndicatorInfo?.name}`}
          className="shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.slice(0, 12).map((country, index) => (
              <motion.div
                key={country.country}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${
                    index < 3 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                      : 'bg-slate-600'
                    } flex items-center justify-center text-sm font-bold text-white`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-200">{country.country}</div>
                    {country.happiness_score && (
                      <div className="text-sm text-slate-400">
                        Happiness: {country.happiness_score.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-cyan-400">
                    {country.indicator_value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedIndicatorInfo?.unit}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default RegionalComparison;
