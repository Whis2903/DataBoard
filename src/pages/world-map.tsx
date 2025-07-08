'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CalendarIcon, GlobeAltIcon, TrophyIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Plot from '../components/Charts';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

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
        toast.success('Map data loaded successfully!');
      }
    } catch (err) {
      setError('Failed to fetch happiness distribution data');
      toast.error('Failed to load map data');
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

  const getHappinessCategory = (score: number) => {
    if (score >= 7) return { label: 'Very Happy', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (score >= 6) return { label: 'Happy', color: 'text-green-300', bgColor: 'bg-green-400/20' };
    if (score >= 5) return { label: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (score >= 4) return { label: 'Low', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { label: 'Very Low', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const groupedByRegion = data.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, CountryData[]>);

  const regionalStats = Object.entries(groupedByRegion).map(([region, countries]) => {
    const avgScore = countries.reduce((sum, c) => sum + c.happinessScore, 0) / countries.length;
    const topCountry = countries[0];
    return { region, avgScore, topCountry, count: countries.length };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const globalStats = data.length > 0 ? {
    avgScore: data.reduce((sum, c) => sum + c.happinessScore, 0) / data.length,
    topCountry: data[0],
    bottomCountry: data[data.length - 1],
    totalCountries: data.length
  } : null;

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <GlobeAltIcon className="w-8 h-8 text-blue-400" />
              World Happiness Distribution
            </h2>
            <p className="text-slate-400 mt-2">
              Explore global happiness patterns across countries and regions
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { range: '7.0+', label: 'Very Happy', color: 'bg-green-500' },
            { range: '6.0-6.9', label: 'Happy', color: 'bg-green-400' },
            { range: '5.0-5.9', label: 'Moderate', color: 'bg-yellow-400' },
            { range: '4.0-4.9', label: 'Low', color: 'bg-orange-400' },
            { range: '< 4.0', label: 'Very Low', color: 'bg-red-400' },
          ].map(({ range, label, color }) => (
            <div key={range} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/30">
              <div className={`w-4 h-4 rounded ${color}`} />
              <div>
                <div className="text-xs text-slate-300 font-medium">{label}</div>
                <div className="text-xs text-slate-500">{range}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hoverable={false} className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {globalStats.avgScore.toFixed(2)}
            </div>
            <div className="text-slate-400">Global Average</div>
          </Card>
          
          <Card hoverable={false} className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              <TrophyIcon className="w-6 h-6 inline mr-1" />
              #{globalStats.topCountry.rank}
            </div>
            <div className="text-slate-400">{globalStats.topCountry.country}</div>
            <div className="text-sm text-green-300">{globalStats.topCountry.happinessScore.toFixed(2)}</div>
          </Card>

          <Card hoverable={false} className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              #{globalStats.bottomCountry.rank}
            </div>
            <div className="text-slate-400">{globalStats.bottomCountry.country}</div>
            <div className="text-sm text-red-300">{globalStats.bottomCountry.happinessScore.toFixed(2)}</div>
          </Card>

          <Card hoverable={false} className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {globalStats.totalCountries}
            </div>
            <div className="text-slate-400">Countries</div>
          </Card>
        </div>
      )}

      {loading ? (
        <Card className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading world map..." />
        </Card>
      ) : data.length > 0 ? (
        <Card 
          title={`Interactive World Happiness Map (${selectedYear})`}
          subtitle="Hover over countries to see detailed information"
          className="shadow-xl"
        >
          <div className="h-96 bg-slate-900/30 rounded-xl p-4">
            <Plot
              data={[{
                type: 'choropleth',
                locations: data.filter(country => country.countryCode).map(country => country.countryCode!),
                z: data.filter(country => country.countryCode).map(country => country.happinessScore),
                text: data.filter(country => country.countryCode).map(country => 
                  `${country.country}<br>Happiness Score: ${country.happinessScore.toFixed(2)}<br>Rank: #${country.rank}<br>Region: ${country.region}`
                ),
                hovertemplate: '%{text}<extra></extra>',
                colorscale: [
                  [0, '#ef4444'],
                  [0.25, '#f97316'],
                  [0.5, '#eab308'],
                  [0.75, '#22c55e'],
                  [1, '#16a34a']
                ],
                reversescale: false,
                colorbar: {
                  title: { text: 'Happiness Score' },
                  titlefont: { color: '#f8fafc' },
                  tickfont: { color: '#f8fafc' }
                }
              }]}
              layout={{
                geo: {
                  showframe: false,
                  showcoastlines: true,
                  coastlinecolor: '#475569',
                  projection: { type: 'natural earth' },
                  showland: true,
                  landcolor: '#334155',
                  showocean: true,
                  oceancolor: '#1e293b',
                  showcountries: true,
                  countrycolor: '#475569'
                },
                margin: { l: 0, r: 0, t: 0, b: 0 },
                dragmode: false
              }}
              config={{
                responsive: true,
                displayModeBar: false,
                staticPlot: false,
                scrollZoom: false,
                doubleClick: false,
                showTips: false
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </Card>
      ) : null}

      {regionalStats.length > 0 && (
        <Card 
          title="Regional Analysis"
          subtitle="Happiness statistics by geographical region"
          className="shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalStats.map(({ region, avgScore, topCountry, count }) => (
              <motion.div
                key={region}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-slate-200">{region}</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Score:</span>
                    <span className={`font-medium ${getHappinessCategory(avgScore).color}`}>
                      {avgScore.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Top Country:</span>
                    <span className="text-slate-200">{topCountry.country}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Countries:</span>
                    <span className="text-slate-200">{count}</span>
                  </div>
                  
                  <div className={`text-center text-xs px-2 py-1 rounded ${getHappinessCategory(avgScore).bgColor} ${getHappinessCategory(avgScore).color}`}>
                    {getHappinessCategory(avgScore).label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Top and Bottom Countries */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 10 Happiest Countries */}
          <Card 
            title="🏆 Happiest Countries"
            subtitle="Top 10 countries with highest happiness scores"
            className="shadow-xl"
          >
            <div className="space-y-3">
              {data.slice(0, 10).map((country, index) => (
                <motion.div
                  key={country.country}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-slate-600'} flex items-center justify-center text-sm font-bold text-white`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-200">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-400">
                      {country.happinessScore.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">{country.region}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Bottom 10 Countries */}
          <Card 
            title="📉 Countries with Challenges"
            subtitle="Countries with lower happiness scores"
            className="shadow-xl"
          >
            <div className="space-y-3">
              {data.slice(-10).reverse().map((country, index) => (
                <motion.div
                  key={country.country}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-white">
                      {country.rank}
                    </div>
                    <span className="font-medium text-slate-200">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-400">
                      {country.happinessScore.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">{country.region}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
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
    </div>
  );
};

export default WorldMap;
