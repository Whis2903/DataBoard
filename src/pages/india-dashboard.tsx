'use client';

import { useState, useEffect } from 'react';
import Plot from '../components/Charts';

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
        // Transform correlation data
        const correlationData = result.data.correlations.map((item: any) => ({
          indicator: item.factorCode,
          correlation: item.correlation,
          indicatorName: getIndicatorName(item.factorCode)
        }));

        // Sort by absolute correlation value
        correlationData.sort((a: CorrelationData, b: CorrelationData) => Math.abs(b.correlation) - Math.abs(a.correlation));
        
        setData(correlationData);

        // Generate insights
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
      }
    } catch (err) {
      setError('Failed to fetch India correlation analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorName = (indicator: string) => {
    const indicatorMap: Record<string, string> = {
      // Original indicator codes
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
      // Factor codes from happiness analysis
      'gdpPerCapita': 'GDP per capita',
      'socialSupport': 'Social support',
      'healthyLifeExpectancy': 'Healthy life expectancy',
      'freedomToMakeLifeChoices': 'Freedom to make life choices',
      'generosity': 'Generosity',
      'perceptionsOfCorruption': 'Perceptions of corruption'
    };
    return indicatorMap[indicator] || indicator;
  };

  // Show all correlations (no filtering by positive/negative)
  const allCorrelations = data.slice(0, 10); // Show top 10 correlations by absolute value

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Updated to show all correlations */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🇮🇳 India-Specific Correlation Dashboard</h2>
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Analyzing correlations between happiness and various economic/social indicators for India
          </p>
          <button
            onClick={handleAnalysis}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing correlations for India...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📊 Key Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="text-green-800 flex items-start">
                <span className="text-green-600 mr-2">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Correlations Chart */}
      {allCorrelations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            � All Correlations with Happiness (Ranked by Strength)
          </h3>
          
          <div className="h-96">
            <Plot
              data={[{
                x: allCorrelations.map((item: CorrelationData) => item.correlation),
                y: allCorrelations.map((item: CorrelationData) => item.indicatorName),
                type: 'bar',
                orientation: 'h',
                marker: { 
                  color: allCorrelations.map((item: CorrelationData) => 
                    item.correlation > 0 ? '#10b981' : '#ef4444'
                  ),
                  line: { width: 1, color: '#374151' }
                },
                text: allCorrelations.map((item: CorrelationData) => item.correlation.toFixed(3)),
                textposition: 'outside',
                textfont: { size: 12, color: '#374151' },
                name: 'Correlations'
              }]}
              layout={{
                title: {
                  text: 'All Factor Correlations with Happiness in India',
                  font: { size: 16 }
                },
                xaxis: { 
                  title: { text: 'Correlation Coefficient' },
                  range: [-1, 1],
                  zeroline: true,
                  zerolinewidth: 2,
                  zerolinecolor: '#6b7280'
                },
                yaxis: { 
                  title: { text: 'Factors' },
                  automargin: true
                },
                autosize: true,
                margin: { l: 200, r: 100, t: 80, b: 60 },
                showlegend: false,
                annotations: [
                  {
                    x: 0.5,
                    y: -0.15,
                    xref: 'paper',
                    yref: 'paper',
                    text: 'Green = Positive Correlation | Red = Negative Correlation',
                    showarrow: false,
                    font: { size: 12, color: '#6b7280' },
                    xanchor: 'center'
                  }
                ]
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          {/* Correlation Table */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Detailed Correlation Values</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correlation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Strength
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direction
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allCorrelations.map((item: CorrelationData, index: number) => (
                    <tr key={item.indicator} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.indicatorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        <span className={`${item.correlation > 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                          {item.correlation.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {Math.abs(item.correlation) > 0.7 ? 'Strong' : 
                         Math.abs(item.correlation) > 0.5 ? 'Moderate' : 
                         Math.abs(item.correlation) > 0.3 ? 'Weak' : 'Very Weak'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.correlation > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.correlation > 0 ? '↗ Positive' : '↘ Negative'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Correlation Table */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📋 Complete Correlation Analysis
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correlation Coefficient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship Strength
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.indicatorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-mono ${item.correlation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.correlation.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        Math.abs(item.correlation) > 0.7 ? 'bg-red-100 text-red-800' :
                        Math.abs(item.correlation) > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {Math.abs(item.correlation) > 0.7 ? 'Strong' : 
                         Math.abs(item.correlation) > 0.4 ? 'Moderate' : 'Weak'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.correlation > 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.correlation > 0 ? 'Positive' : 'Negative'}
                      </span>
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

export default IndiaDashboard;
