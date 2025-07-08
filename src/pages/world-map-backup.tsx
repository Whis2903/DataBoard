'use client';

import { useState, useEffect } from 'react';
import Plot from '../components/Charts';

interface CountryData {
  country: string;
  countryCode?: string;
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
        const sortedData = result.data
          .sort((a: CountryData, b: CountryData) => b.happinessScore - a.happinessScore)
          .map((item: CountryData, index: number) => ({
            ...item,
            rank: index + 1,
            countryCode: getCountryCode(item.country)
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
  const getCountryCode = (countryName: string): string => {
    const countryMap: Record<string, string> = {
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
      'Democratic Republic of the Congo': 'COD', 'Central African Republic': 'CAF',
      'Cameroon': 'CMR', 'Comoros': 'COM', 'Djibouti': 'DJI',
      'Eritrea': 'ERI', 'Eswatini': 'SWZ', 'Lesotho': 'LSO', 'Madagascar': 'MDG',
      'Malawi': 'MWI', 'Mauritius': 'MUS', 'Mozambique': 'MOZ', 'Namibia': 'NAM',
      'Rwanda': 'RWA', 'Seychelles': 'SYC', 'Somalia': 'SOM', 'Tanzania': 'TZA',
      'Uganda': 'UGA', 'Zambia': 'ZMB', 'Zimbabwe': 'ZWE', 'Botswana': 'BWA',
      'Angola': 'AGO'
    };
    return countryMap[countryName] || '';
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

        {}
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

      {}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🗺️ Interactive World Happiness Map ({selectedYear})
          </h3>
          
          <div className="h-96 mb-4">
            <Plot
              data={[{
                type: 'choropleth',
                locations: data.filter(country => country.countryCode).map(country => country.countryCode!),
                z: data.filter(country => country.countryCode).map(country => country.happinessScore),
                text: data.filter(country => country.countryCode).map(country => `${country.country}<br>Happiness Score: ${country.happinessScore.toFixed(2)}<br>Rank: #${country.rank}<br>Region: ${country.region}`),
                hovertemplate: '%{text}<extra></extra>',
                colorscale: [
                  [0, '#ef4444'],    
                  [0.25, '#f97316'], 
                  [0.5, '#eab308'],  
                  [0.75, '#22c55e'], 
                  [1, '#16a34a']     
                ],
                zmin: 2,
                zmax: 8,
                colorbar: {
                  title: {
                    text: 'Happiness Score',
                    font: { size: 14 }
                  },
                  thickness: 15,
                  len: 0.8,
                  x: 1.02
                }
              }]}
              layout={{
                title: {
                  text: `World Happiness Distribution ${selectedYear}`,
                  font: { size: 18 },
                  x: 0.5
                },
                geo: {
                  showframe: false,
                  showcoastlines: true,
                  projection: { type: 'natural earth' },
                  bgcolor: '#f8fafc',
                  coastlinecolor: '#64748b',
                  showland: true,
                  landcolor: '#f1f5f9',
                  showocean: true,
                  oceancolor: '#e2e8f0'
                },
                autosize: true,
                margin: { l: 0, r: 60, t: 60, b: 0 },
                hoverlabel: {
                  bgcolor: 'white',
                  bordercolor: '#d1d5db',
                  font: { size: 12 }
                }
              }}
              config={{ 
                responsive: true, 
                displayModeBar: false,
                showTips: false
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Happiest Country</p>
              <p className="text-lg font-bold text-green-900">{data[0]?.country}</p>
              <p className="text-sm text-green-600">{data[0]?.happinessScore.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Global Average</p>
              <p className="text-2xl font-bold text-blue-900">
                {(data.reduce((sum, c) => sum + c.happinessScore, 0) / data.length).toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Countries Analyzed</p>
              <p className="text-2xl font-bold text-yellow-900">{data.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Happiness Range</p>
              <p className="text-lg font-bold text-purple-900">
                {Math.min(...data.map(c => c.happinessScore)).toFixed(1)} - {Math.max(...data.map(c => c.happinessScore)).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {}
      {loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading happiness data for {selectedYear}...</p>
        </div>
      )}

      {}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {}
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

      {}
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
    </div>
  );
};

export default WorldMap;
