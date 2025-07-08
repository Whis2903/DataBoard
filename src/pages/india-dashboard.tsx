'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  AcademicCapIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import Plot from '../components/Charts';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

interface CorrelationData {
  indicator: string;
  correlation: number;
  indicatorName: string;
}

const IndiaDashboard = () => {
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2023);
  const [data, setData] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState<string[]>([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    handleAnalysis();
  }, []);

  const handleAnalysis = async () => {
    setLoading(true);
    setError('');
    setData([]);
    setInsights([]);

    try {
      const response = await fetch(`${API_BASE}/happiness/analysis/india`);
      const result = await response.json();
      
      if (result.data && result.data.correlations) {
        const correlationData = result.data.correlations.map((item: any) => ({
          indicator: item.factorCode,
          correlation: item.correlation,
          indicatorName: getIndicatorName(item.factorCode)
        }));

        correlationData.sort((a: CorrelationData, b: CorrelationData) => Math.abs(b.correlation) - Math.abs(a.correlation));
        
        setData(correlationData);

        const topPositive = correlationData.filter((d: CorrelationData) => d.correlation > 0).slice(0, 2);
        const topNegative = correlationData.filter((d: CorrelationData) => d.correlation < 0).slice(0, 2);
        const strongCorrelations = correlationData.filter((d: CorrelationData) => Math.abs(d.correlation) > 0.7);
        const moderateCorrelations = correlationData.filter((d: CorrelationData) => Math.abs(d.correlation) > 0.5 && Math.abs(d.correlation) <= 0.7);
        
        const generatedInsights = [
          `📈 Strongest positive correlation: ${topPositive[0]?.indicatorName} (${topPositive[0]?.correlation.toFixed(3)})`,
          `📉 Strongest negative correlation: ${topNegative[0]?.indicatorName} (${topNegative[0]?.correlation.toFixed(3)})`,
          `🎯 Total factors analyzed: ${correlationData.length}`,
          `💪 Strong correlations (|r| > 0.7): ${strongCorrelations.length} factors`,
          `📊 Moderate correlations (|r| > 0.5): ${moderateCorrelations.length} factors`,
          `⚖️ Balance: ${topPositive.length} positive vs ${topNegative.length} negative correlations in top rankings`
        ];
        
        setInsights(generatedInsights);
        toast.success('India analysis completed successfully!');
      }
    } catch (err) {
      setError('Failed to fetch India correlation analysis');
      toast.error('Failed to load India analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorName = (indicator: string) => {
    const indicatorMap: Record<string, string> = {
      'NY.GDP.PCAP.CD': 'GDP per capita',
      'SP.POP.TOTL': 'Population',
      'SH.XPD.CHEX.GD.ZS': 'Health expenditure (% of GDP)',
      'SE.XPD.TOTL.GD.ZS': 'Education expenditure (% of GDP)',
      'NY.GDP.MKTP.CD': 'GDP (current US$)',
      'SH.DYN.MORT': 'Mortality rate',
      'SE.ADT.LITR.ZS': 'Adult literacy rate',
      'SP.URB.TOTL.IN.ZS': 'Urban population (%)',
      'EN.ATM.CO2E.PC': 'CO2 emissions (metric tons per capita)',
      'SL.UEM.TOTL.ZS': 'Unemployment rate',
      'gdpPerCapita': 'GDP per capita',
      'socialSupport': 'Social support',
      'healthyLifeExpectancy': 'Healthy life expectancy',
      'freedomToMakeLifeChoices': 'Freedom to make life choices',
      'generosity': 'Generosity',
      'perceptionsOfCorruption': 'Perceptions of corruption'
    };
    return indicatorMap[indicator] || indicator;
  };

  const getCorrelationIcon = (indicator: string) => {
    if (indicator.includes('GDP') || indicator.includes('gdpPerCapita')) return CurrencyDollarIcon;
    if (indicator.includes('Health') || indicator.includes('health')) return HeartIcon;
    if (indicator.includes('Education') || indicator.includes('literacy')) return AcademicCapIcon;
    return ChartBarIcon;
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return { label: 'Very Strong', color: 'text-purple-400' };
    if (abs >= 0.6) return { label: 'Strong', color: 'text-blue-400' };
    if (abs >= 0.4) return { label: 'Moderate', color: 'text-yellow-400' };
    if (abs >= 0.2) return { label: 'Weak', color: 'text-orange-400' };
    return { label: 'Very Weak', color: 'text-red-400' };
  };

  const allCorrelations = data.slice(0, 10);
  const positiveCorrelations = data.filter(d => d.correlation > 0);
  const negativeCorrelations = data.filter(d => d.correlation < 0);

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <BuildingLibraryIcon className="w-8 h-8 text-orange-400" />
              🇮🇳 India Happiness Analysis
            </h2>
            <p className="text-slate-400 mt-2">
              Deep dive into factors influencing happiness in India
            </p>
          </div>
          
          <motion.button
            onClick={handleAnalysis}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-orange-500/25"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Analyzing...
              </>
            ) : (
              'Refresh Analysis'
            )}
          </motion.button>
        </div>

        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-900/30 rounded-xl">
              <div className="text-2xl font-bold text-blue-400">{data.length}</div>
              <div className="text-sm text-slate-400">Total Factors</div>
            </div>
            <div className="text-center p-4 bg-slate-900/30 rounded-xl">
              <div className="text-2xl font-bold text-green-400">{positiveCorrelations.length}</div>
              <div className="text-sm text-slate-400">Positive</div>
            </div>
            <div className="text-center p-4 bg-slate-900/30 rounded-xl">
              <div className="text-2xl font-bold text-red-400">{negativeCorrelations.length}</div>
              <div className="text-sm text-slate-400">Negative</div>
            </div>
            <div className="text-center p-4 bg-slate-900/30 rounded-xl">
              <div className="text-2xl font-bold text-purple-400">
                {data.filter(d => Math.abs(d.correlation) > 0.7).length}
              </div>
              <div className="text-sm text-slate-400">Strong (|r| &gt; 0.7)</div>
            </div>
          </div>
        )}
      </Card>

      {loading && (
        <Card className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Analyzing India's happiness factors..." />
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

      {allCorrelations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card 
            title="Correlation Analysis"
            subtitle="Top 10 factors and their correlation with happiness"
            className="shadow-xl"
          >
            <div className="h-96 bg-slate-900/30 rounded-xl p-4">
              <Plot
                data={[{
                  x: allCorrelations.map(d => d.correlation),
                  y: allCorrelations.map(d => d.indicatorName),
                  type: 'bar',
                  orientation: 'h',
                  marker: {
                    color: allCorrelations.map(d => 
                      d.correlation > 0 ? '#10b981' : '#ef4444'
                    ),
                    line: {
                      color: '#1e293b',
                      width: 1
                    }
                  },
                  text: allCorrelations.map(d => d.correlation.toFixed(3)),
                  textposition: 'auto',
                  hovertemplate: '%{y}<br>Correlation: %{x:.3f}<extra></extra>'
                }]}
                layout={{
                  title: {
                    text: '',
                    font: { color: '#f8fafc' }
                  },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: {
                    title: { text: 'Correlation Coefficient', font: { color: '#94a3b8' } },
                    color: '#94a3b8',
                    gridcolor: '#334155',
                    range: [-1, 1]
                  },
                  yaxis: {
                    title: { text: '', font: { color: '#94a3b8' } },
                    color: '#94a3b8',
                    gridcolor: '#334155'
                  },
                  autosize: true,
                  margin: { l: 200, r: 50, t: 50, b: 60 },
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

          {/* Detailed Correlations List */}
          <Card 
            title="Detailed Analysis"
            subtitle="Correlation strength and direction for each factor"
            className="shadow-xl"
          >
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allCorrelations.map((item, index) => {
                const IconComponent = getCorrelationIcon(item.indicator);
                const strength = getCorrelationStrength(item.correlation);
                
                return (
                  <motion.div
                    key={item.indicator}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-200">
                          {item.indicatorName}
                        </div>
                        <div className={`text-sm ${strength.color}`}>
                          {strength.label}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2">
                      {item.correlation > 0 ? (
                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
                      )}
                      <div className={`font-bold text-lg ${item.correlation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.correlation.toFixed(3)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card 
          title="Key Insights"
          subtitle="Automated analysis of India's happiness factors"
          className="shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/30"
              >
                <p className="text-slate-200">{insight}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Positive vs Negative Correlations Summary */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Positive Correlations */}
          <Card 
            title="Positive Correlations"
            subtitle="Factors that increase with happiness"
            className="shadow-xl"
          >
            <div className="space-y-3">
              {positiveCorrelations.slice(0, 5).map((item, index) => (
                <div key={item.indicator} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-slate-200">{item.indicatorName}</span>
                  <div className="flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">+{item.correlation.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Negative Correlations */}
          <Card 
            title="Negative Correlations"
            subtitle="Factors that decrease with happiness"
            className="shadow-xl"
          >
            <div className="space-y-3">
              {negativeCorrelations.slice(0, 5).map((item, index) => (
                <div key={item.indicator} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <span className="text-slate-200">{item.indicatorName}</span>
                  <div className="flex items-center gap-2">
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-red-400">{item.correlation.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IndiaDashboard;
